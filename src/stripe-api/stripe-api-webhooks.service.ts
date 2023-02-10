import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthnodeApiService } from '../authnode-api/authnode-api.service';
import { UserStatus } from '../authnode-api/types/user-status.enum';
import { BillingTransactionRepository } from '../billing-api/repositories/billing-transaction.repository';
import { BillingTransactionStatus } from '../billing-api/types/billing-transaction-status.enum';
import { PaymentProvider } from '../billing-api/types/payment-provider.enum';
import { APP_CONFIGS_KEY, TAppConfigs } from '../common/config';
import { TariffRepository } from '../tariff-api/repositories/tariffs.repository';
import { UserPlanRepository } from '../tariff-api/repositories/userPlan.repository';
import { StripeEventRepository } from './repositories/stripe-event.repository';
import { UserCardRepository } from './repositories/user-card.repository';
import Stripe from 'stripe';
import { BillingTransactionType } from '../billing-api/types/billing-transaction-type.enum';
import { CommonService } from '../common/common.service';

@Injectable()
export class StripeApiWebhooksService {
  constructor(
    @Inject(APP_CONFIGS_KEY)
    private readonly appConfigs: TAppConfigs,
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
    private readonly commonService: CommonService,
  ) {}

  public async paymentIntentSucceeded(stripe: Stripe, event): Promise<void> {
    const paymentIntent = event.data.object;

    const billingTransaction =
      await this.billingTransactionRepo.getByPaymentIntentId(paymentIntent.id);

    const shouldOnlyUpdateTransaction =
      billingTransaction.paymentPayload.newPaymentIntentId ===
      paymentIntent.client_secret;

    const user = await this.authnodeApiService.getUserByStripeCustomerId(
      paymentIntent.customer,
    );

    const card = await this.userCardRepo.saveCard(user.id, paymentIntent);

    try {
      if (billingTransaction.refundable) {
        await stripe.refunds.create({
          payment_intent: paymentIntent.id,
          amount: +billingTransaction.amount,
        });
      }

      let planIdToActivate = billingTransaction.userPlanId;

      const isCardValidation =
        billingTransaction.type === BillingTransactionType.CARD_VALIDATION;

      if (user.status === UserStatus.Trial && !isCardValidation) {
        const tariff = await this.tariffRepo.findOne({
          id: billingTransaction.tariffId,
        });

        const newPlan = await this.userPlanRepo.createForUser({
          user,
          tariff,
        });

        planIdToActivate = newPlan.id;

        await this.authnodeApiService.updateUserStatus(
          user.id,
          UserStatus.Active,
        );

        await this.userPlanRepo.activatePlan(user.id, planIdToActivate);

        await this.authnodeApiService.updateUserTariffId(user.id, tariff.id);

        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
        });

        await Promise.all(
          subscriptions.data.map(async ({ id }) => {
            await stripe.subscriptions.del(id);
          }),
        );

        await stripe.subscriptions.create({
          customer: user.stripeCustomerId,
          payment_settings: {
            payment_method_types: ['card'],
          },
          trial_end: this.commonService.getTrialEnd(),
          items: [{ price: tariff.price_id }],
        });
      }

      if (shouldOnlyUpdateTransaction) {
        await this.billingTransactionRepo.update(
          { id: billingTransaction.id },
          { status: BillingTransactionStatus.SUCCESS },
        );
      } else {
        await this.billingTransactionRepo.finishTransaction_Old({
          userId: user.id,
          cardId: card.id,
          paymentPayload: {
            field: 'paymentIntentId',
            value: paymentIntent.id,
          },
          userPlanId: planIdToActivate,
          paymentProvider: PaymentProvider.STRIPE,
          status: BillingTransactionStatus.SUCCESS,
        });
      }

      if (billingTransaction.userPlanId) {
        await this.billingTransactionRepo.update(
          {
            userId: billingTransaction.id,
            userPlanId: billingTransaction.userPlanId,
            status: BillingTransactionStatus.FAILED,
          },
          { status: BillingTransactionStatus.SUCCESS },
        );
      }
    } catch (err) {
      await this.billingTransactionRepo.finishTransaction_Old({
        userId: user.id,
        cardId: card.id,
        paymentPayload: {
          field: 'paymentIntentId',
          value: paymentIntent.id,
        },
        errors: JSON.stringify(err),
        paymentProvider: PaymentProvider.STRIPE,
        status: BillingTransactionStatus.FAILED,
      });
    }
  }

  public async paymentIntentFailed(stripe: Stripe, event): Promise<void> {
    const paymentIntent = event.data.object;

    const tx = await this.billingTransactionRepo.getByPaymentIntentId(
      paymentIntent.id,
    );

    if (tx.type === BillingTransactionType.CARD_VALIDATION) {
      await this.billingTransactionRepo.finishTransaction({
        paymentIntentId: paymentIntent.id,
        payload: { status: BillingTransactionStatus.FAILED },
      });

      return;
    }

    const user = await this.authnodeApiService.getUserByStripeCustomerId(
      paymentIntent.customer,
    );

    const newPaymentIntent = await stripe.paymentIntents.create({
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer: user.stripeCustomerId,
      automatic_payment_methods: {
        enabled: true,
      },
      setup_future_usage: 'off_session',
    });

    const payload = {
      userId: user.id,
      status: BillingTransactionStatus.FAILED,
      paymentPayload: {
        ...tx.paymentPayload,
        newPaymentIntentId: newPaymentIntent.client_secret,
      },
    };

    await this.billingTransactionRepo.finishTransaction({
      paymentIntentId: paymentIntent.id,
      payload,
    });
  }

  public async subscriptionCreated(stripe: Stripe, event): Promise<void> {
    const subscription = event.data.object;

    const user = await this.authnodeApiService.getUserByStripeCustomerId(
      subscription.customer,
    );

    const billingTransaction =
      await this.billingTransactionRepo.getUnfinishedDelayedSubscription({
        userId: user.id,
      });

    const userPlan = await this.userPlanRepo.findOneOrFail({
      where: {
        id: billingTransaction.userPlanId,
      },
    });

    const needApplyCurrentPlan = userPlan.created_at.getTime() < Date.now();

    if (needApplyCurrentPlan) {
      await this.userPlanRepo.activatePlan(user.id, userPlan.id);

      await this.authnodeApiService.updateUserTariffId(
        user.id,
        userPlan.tariff_id,
      );
    } else {
      await this.authnodeApiService.updateUserNextTariffId(
        user.id,
        userPlan.tariff_id,
      );
    }

    if (user.status !== UserStatus.Active) {
      await this.authnodeApiService.updateUserStatus(
        user.id,
        UserStatus.Active,
      );
    }

    await this.billingTransactionRepo.update(
      {
        id: billingTransaction.id,
      },
      {
        paymentPayload: {
          subscriptionId: subscription.id,
        } as any,
      },
    );

    await this.billingTransactionRepo.finishTransaction_Old({
      userId: user.id,
      cardId: billingTransaction.cardId,
      paymentProvider: PaymentProvider.STRIPE,
      status: BillingTransactionStatus.SUCCESS,
      paymentPayload: {
        field: 'subscriptionId',
        value: subscription.id,
      },
    });
  }
}
