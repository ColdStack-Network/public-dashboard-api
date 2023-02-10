import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import Stripe from 'stripe';
import { AuthnodeApiService } from '../authnode-api/authnode-api.service';
import { IUser } from '../authnode-api/interfaces/user.interface';
import { UserStatus } from '../authnode-api/types/user-status.enum';
import {
  CARD_VALIDATION_PRICE,
  DEFAULT_CURRENCY,
} from '../billing-api/constants/prices-for-services';
import { BillingTransactionRepository } from '../billing-api/repositories/billing-transaction.repository';
import { v4 as uuidv4 } from 'uuid';
import { BillingTransactionType } from '../billing-api/types/billing-transaction-type.enum';
import { PaymentProvider } from '../billing-api/types/payment-provider.enum';
import { CommonService } from '../common/common.service';
import { APP_CONFIGS_KEY, TAppConfigs } from '../common/config';
import { TariffsEntity } from '../tariff-api/entities/tariffs.entity';
import { UserPlanEntity } from '../tariff-api/entities/userPlan.entity';
import { TariffRepository } from '../tariff-api/repositories/tariffs.repository';
import { UserPlanRepository } from '../tariff-api/repositories/userPlan.repository';
import { GetStripeQuery } from './dto/get-stripe-secret.dto';
import { StripeEventRepository } from './repositories/stripe-event.repository';
import { UserCardRepository } from './repositories/user-card.repository';
import { StripeApiWebhooksService } from './stripe-api-webhooks.service';

@Injectable()
export class StripeApiService {
  constructor(
    @Inject(APP_CONFIGS_KEY)
    private readonly appConfigs: TAppConfigs,
    @InjectPinoLogger(AuthnodeApiService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(UserPlanRepository, 'default')
    private readonly userPlanRepo: UserPlanRepository,
    @InjectRepository(TariffRepository, 'default')
    private readonly tariffRepo: TariffRepository,
    @InjectRepository(UserCardRepository, 'default')
    private readonly userCardRepo: UserCardRepository,
    @InjectRepository(BillingTransactionRepository, 'default')
    private readonly billingTransactionRepo: BillingTransactionRepository,
    @InjectRepository(StripeEventRepository, 'default')
    private readonly stripeEventRepo: StripeEventRepository,
    private readonly authnodeApiService: AuthnodeApiService,
    private readonly webhooksService: StripeApiWebhooksService,
    private readonly commonService: CommonService,
  ) {}

  public async createCheckoutSession(lookupKey: string) {
    const stripe = this.getStripe();

    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      expand: ['data.product'],
    });

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: prices.data[0].id,
          // For metered billing, do not pass quantity
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.appConfigs.domain.url}/success.html`,
      cancel_url: `${this.appConfigs.domain.url}/cancel.html`,
    });

    return session;
  }

  public async createPortalSession(sessionId) {
    const stripe = this.getStripe();

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const returnUrl = this.appConfigs.domain.url;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer as string,
      return_url: returnUrl,
    });

    return portalSession;
  }

  public async createSubscriptionForTariff(
    user: IUser,
    tariff: TariffsEntity,
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    const stripe = this.getStripe();

    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      payment_settings: {
        payment_method_types: ['card'],
      },
      trial_end: this.commonService.getTrialEnd(),
      items: [{ price: tariff.price_id }],
    });

    return subscription;
  }

  public async subscribe(params: {
    user: IUser;
    tariffId: number;
    shouldCreateNewUserPlan: boolean;
    subscriptionType?: BillingTransactionType;
  }): Promise<{ userPlan: UserPlanEntity; transactionId: string }> {
    const {
      user,
      tariffId,
      shouldCreateNewUserPlan,
      subscriptionType = BillingTransactionType.SUBSCRIPTION,
    } = params;

    const stripe = this.getStripe();

    const tariff = await this.tariffRepo.getByIdOrFail(tariffId);

    const userDefaultCard = await this.userCardRepo.getDefaultCardForUser(
      user.id,
    );

    let userPlan = await this.userPlanRepo.getActiveForUser(user);

    let billingTransaction;

    const billingTransactionId = uuidv4();

    let startDate;

    if (user.status === UserStatus.Trial) {
      startDate = new Date();
    } else {
      startDate = userPlan ? userPlan.end_at : new Date();
    }

    if (shouldCreateNewUserPlan) {
      userPlan = await this.userPlanRepo.createForUser({
        user,
        tariff,
        startDate,
      });
    }

    if (userDefaultCard) {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });

      const defaultPaymentMethod = paymentMethods.data.find(
        ({ card }) => card.last4 == userDefaultCard.last4,
      );

      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: defaultPaymentMethod.id,
        },
      });

      await this.billingTransactionRepo.cancelPendingDelayedSubscriptions(
        user.id,
      );

      billingTransaction = await this.billingTransactionRepo.save({
        id: billingTransactionId,
        userId: user.id,
        userPlanId: userPlan.id,
        paymentProvider: PaymentProvider.STRIPE,
        amount: tariff.price * 100,
        tariffId: tariff.id,
        type: subscriptionType,
        cardId: userDefaultCard.id,
      });
    } else {
      const paymentIntent = await this.getOrCreatePaymentIntent({
        user,
        isCardValidation: true,
        stripeCustomerId: user.stripeCustomerId,
        amount: CARD_VALIDATION_PRICE,
      });

      billingTransaction = await this.billingTransactionRepo.save({
        id: billingTransactionId,
        userId: user.id,
        userPlanId: userPlan.id,
        paymentProvider: PaymentProvider.STRIPE,
        amount: tariff.price * 100,
        tariffId: tariff.id,
        type: BillingTransactionType.PRE_SUBSCRIPTION_PAYMENT,
        paymentPayload: { paymentIntentId: paymentIntent.id },
      });

      await this.billingTransactionRepo.cancelPendingDelayedSubscriptions(
        user.id,
      );

      await this.billingTransactionRepo.save({
        userId: user.id,
        userPlanId: userPlan.id,
        paymentProvider: PaymentProvider.STRIPE,
        amount: tariff.price * 100,
        tariffId: tariff.id,
        type: subscriptionType,
      });
    }

    await this.deleteSubscriptions(user);

    await this.createSubscriptionForTariff(user, tariff);

    return { userPlan, transactionId: billingTransaction.id };
  }

  public async webhook(req: Request) {
    const stripe = this.getStripe();

    const signature = req.headers['stripe-signature'];

    let event = req.body;
    // Replace this endpoint secret with your endpoint's unique secret
    // If you are testing with the CLI, find the secret by running 'stripe listen'
    // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
    // at https://dashboard.stripe.com/webhooks
    const endpointSecret = this.appConfigs.stripe.webhookSecret;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      try {
        event = stripe.webhooks.constructEvent(
          req['rawBody'],
          signature,
          endpointSecret,
        );
      } catch (err) {
        this.logger.error(err);
        throw new Error(
          `⚠️  Webhook signature verification failed. ${err.message}`,
        );
      }
    }

    this.logger.info(`Stripe webhook: ${event.type}`);

    this.stripeEventRepo.save({ event });

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        await this.webhooksService.paymentIntentSucceeded(stripe, event);

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;

        this.logger.info(`Stripe Payment Failed: ${paymentIntent.id}`);

        await this.webhooksService.paymentIntentFailed(stripe, event);
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object;

        this.logger.info(`Stripe Payment Canceled: ${paymentIntent.id}`);

        await this.webhooksService.paymentIntentFailed(stripe, event);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        const status = subscription.status;

        this.logger.info(`Stripe Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription deleted.
        // handleSubscriptionDeleted(subscriptionDeleted);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;

        const status = subscription.status;

        this.logger.info(`Stripe Subscription status is ${status}.`);

        await this.webhooksService.subscriptionCreated(stripe, event);

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const status = subscription.status;
        this.logger.info(
          `Stripe Subscription status is ${status} for ${subscription.id}.`,
        );

        // Then define and call a method to handle the subscription update.
        // handleSubscriptionUpdated(subscription);
        break;
      }
      default:
        // Unexpected event type
        this.logger.info(`Stripe Unhandled event type ${event.type}.`);
    }
  }

  public async getSecret(
    user: IUser,
    { cardValidation, tariffId }: GetStripeQuery,
  ) {
    const stripe = this.getStripe();

    const isCardValidation = Boolean(cardValidation);

    const defaultTariffId = user.companyId
      ? this.commonService.getDefaultTariffIdForCompany()
      : this.commonService.getDefaultTariffId();

    const tariff = await this.tariffRepo.findOne({
      id: tariffId || defaultTariffId,
    });

    const userHasDefaultCard = !!(await this.userCardRepo.getDefaultCardForUser(
      user.id,
    ));

    if (isCardValidation || !userHasDefaultCard) {
      const existingTxForCardValidation =
        await this.billingTransactionRepo.getPending({
          userId: user.id,
          tariffId: isCardValidation ? null : tariff.id,
          type: BillingTransactionType.CARD_VALIDATION,
        });

      if (existingTxForCardValidation) {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          existingTxForCardValidation.paymentPayload.paymentIntentId,
        );

        return { client_secret: paymentIntent.client_secret };
      }
    }

    const stripeCustomerId = await this.getOrCreateUserCustomerId(user.id);

    const paymentIntent = await this.getOrCreatePaymentIntent({
      user,
      isCardValidation,
      stripeCustomerId,
      amount: cardValidation ? CARD_VALIDATION_PRICE : tariff.price * 100,
      tariffId: tariff.id,
    });

    return { client_secret: paymentIntent.client_secret };
  }

  public getStripe() {
    const apiKey = this.appConfigs.stripe.privateKey;

    return new Stripe(apiKey, {
      apiVersion: '2020-08-27',
      appInfo: {
        name: process.env.STRIPE_APP_NAME,
      },
    });
  }

  public async deleteSubscriptions(user: IUser): Promise<void> {
    const stripe = this.getStripe();

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
    });

    await Promise.all(
      subscriptions.data.map(async ({ id }) => {
        await stripe.subscriptions.del(id);
      }),
    );
  }

  public async renovateSubscription(user: IUser): Promise<void> {
    const stripe = this.getStripe();

    const tariff = await this.tariffRepo.findOne({
      where: {
        id: user.tariffId,
      },
    });

    await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      payment_settings: {
        payment_method_types: ['card'],
      },
      trial_end: this.commonService.getTrialEnd(),
      items: [{ price: tariff.price_id }],
    });
  }

  public initCustomer(userId: string) {
    const stripe = this.getStripe();

    return stripe.customers.create({
      description: `User ID: ${userId}`,
    });
  }

  public async getOrCreateUserCustomerId(userId: string): Promise<string> {
    let stripeCustomerId: string =
      await this.authnodeApiService.getStripeCustomerForUser(userId);

    if (!stripeCustomerId) {
      const stripeCustomer = await this.initCustomer(userId);

      stripeCustomerId = stripeCustomer.id;

      await this.authnodeApiService.updateStripeCustomerId(
        userId,
        stripeCustomerId,
      );
    }

    return stripeCustomerId;
  }

  private async getOrCreatePaymentIntent(params: {
    user: IUser;
    stripeCustomerId: string;
    isCardValidation: boolean;
    amount: number;
    tariffId?: number;
  }): Promise<Stripe.PaymentIntent> {
    const stripe = this.getStripe();

    const { user, stripeCustomerId, isCardValidation, amount, tariffId } =
      params;

    const unfinishedPaymentTransaction =
      await this.billingTransactionRepo.getUnfinishedByType({
        userId: user.id,
        tariffId,
        type: isCardValidation
          ? BillingTransactionType.CARD_VALIDATION
          : BillingTransactionType.SUBSCRIPTION,
      });

    let paymentIntent: Stripe.PaymentIntent;

    if (unfinishedPaymentTransaction) {
      paymentIntent = await stripe.paymentIntents.retrieve(
        unfinishedPaymentTransaction.paymentPayload.paymentIntentId,
      );
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: DEFAULT_CURRENCY,
        customer: stripeCustomerId,
        automatic_payment_methods: {
          enabled: true,
        },
        setup_future_usage: 'off_session',
      });

      let userPlan;

      if (isCardValidation) {
        userPlan = await this.userPlanRepo.getActiveForUser(user);
      }

      await this.billingTransactionRepo.save({
        userId: user.id,
        userPlanId: userPlan?.id,
        paymentProvider: PaymentProvider.STRIPE,
        amount,
        tariffId: isCardValidation ? null : tariffId,
        type: isCardValidation
          ? BillingTransactionType.CARD_VALIDATION
          : BillingTransactionType.SUBSCRIPTION,
        paymentPayload: { paymentIntentId: paymentIntent.id },
        refundable: isCardValidation,
      });
    }

    return paymentIntent;
  }

  async getInvoicesForCustomer(customerId): Promise<any> {
    const stripe = this.getStripe();

    const invoices = await stripe.invoices.list({ customer: customerId });

    return invoices;
  }

  async sendUsageRecord(user: IUser): Promise<void> {
    const stripe = this.getStripe();

    const userSubscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
    });

    if (userSubscriptions?.data?.length) {
      const subscriptionId = userSubscriptions[0].data.id;

      await stripe.subscriptionItems.createUsageRecord(subscriptionId, {
        quantity: 1,
        timestamp: Date.now(),
      });
    }
  }

  // test method
  async deleteSubAndUserCard(userId: string) {
    const defaultTariffId = this.commonService.getDefaultTariffId();

    const user = await this.authnodeApiService.getUserById(userId);

    await this.deleteSubscriptions(user);
    await this.userCardRepo.delete({ userId: user.id });
    await this.userPlanRepo.delete({ user_id: user.id });
    await this.billingTransactionRepo.delete({ userId: user.id });

    await this.authnodeApiService.updateUserTariffId(user.id, defaultTariffId);
    await this.authnodeApiService.updateUserStatus(user.id, UserStatus.Trial);

    await this.userPlanRepo.createForUser({
      user,
      tariff: await this.tariffRepo.findOne({
        id: defaultTariffId,
      }),
      active: true,
    });
  }
}
