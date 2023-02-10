import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthnodeApiService } from '../authnode-api/authnode-api.service';
import { IUser } from '../authnode-api/interfaces/user.interface';
import { UserStatus } from '../authnode-api/types/user-status.enum';
import {
  CARD_VALIDATION_PRICE,
  DEFAULT_CURRENCY,
} from '../billing-api/constants/prices-for-services';
import { BillingTransactionRepository } from '../billing-api/repositories/billing-transaction.repository';
import { BillingTransactionStatus } from '../billing-api/types/billing-transaction-status.enum';
import { BillingTransactionType } from '../billing-api/types/billing-transaction-type.enum';
import { PaymentProvider } from '../billing-api/types/payment-provider.enum';
import { CommonService } from '../common/common.service';
import { UserCardRepository } from '../stripe-api/repositories/user-card.repository';
import { StripeApiService } from '../stripe-api/stripe-api.service';
import { TariffRepository } from '../tariff-api/repositories/tariffs.repository';
import { UserPlanRepository } from '../tariff-api/repositories/userPlan.repository';

@Injectable()
export class DevApiService {
  constructor(
    private stripeService: StripeApiService,
    private authApiService: AuthnodeApiService,
    private commonService: CommonService,
    private readonly stripeApiService: StripeApiService,

    @InjectRepository(UserPlanRepository, 'default')
    private readonly userPlanRepo: UserPlanRepository,
    @InjectRepository(UserCardRepository, 'default')
    private readonly userCardRepo: UserCardRepository,
    @InjectRepository(BillingTransactionRepository, 'default')
    private readonly billingTransactionRepo: BillingTransactionRepository,
    private readonly tariffRepo: TariffRepository,
  ) {}

  async resetUserProfile(userDto: IUser): Promise<IUser> {
    const { id } = userDto;

    const defaultTariffId = this.commonService.getDefaultTariffId();

    await this.authApiService.genAccessKeyForFirstSub(userDto.id);

    userDto.tariffId = defaultTariffId;

    if (!userDto.stripeCustomerId) {
      const stripeCustomerId =
        await this.stripeService.getOrCreateUserCustomerId(userDto.id);
      userDto.stripeCustomerId = stripeCustomerId;
    }

    await Promise.all([
      this.billingTransactionRepo.delete({
        userId: id,
      }),
      this.userPlanRepo.delete({
        user_id: id,
      }),
      this.userCardRepo.delete({
        userId: id,
      }),
    ]);

    await this.stripeService.subscribe({
      user: userDto,
      tariffId: defaultTariffId,
      shouldCreateNewUserPlan: true,
    });
    const rep = await this.authApiService.resetUserProfileAfterSignUpState(id);
    return rep;
  }

  async updateUserStatus(user: IUser, status: UserStatus): Promise<void> {
    await this.authApiService.updateUserStatus(user.id, status);
    const activePlan = await this.userPlanRepo.getActiveForUser(user);

    switch (status) {
      case UserStatus.PaymentRequired: {
        await this.userPlanRepo.update(
          { id: activePlan.id },
          { end_at: `NOW() + interval '7' day` },
        );
        break;
      }
      case UserStatus.Expired: {
        await this.userPlanRepo.update(
          { id: activePlan.id },
          { end_at: `NOW()` },
        );
        break;
      }
      case UserStatus.Suspended: {
        await this.userPlanRepo.update(
          { id: activePlan.id },
          { end_at: `NOW() - interval '7' day` },
        );
        break;
      }
      default:
        break;
    }
  }

  async forceUpdateTrialEnd(user: IUser, date: Date): Promise<void> {
    const activePlan = await this.userPlanRepo.getActiveForUser(user);

    await this.authApiService.updateUserStatus(
      activePlan.user_id,
      UserStatus.Trial,
    );

    await this.userPlanRepo.update(
      { id: activePlan.id },
      { end_at: new Date(date) },
    );
  }

  async createFailedBillingTransaction(user: IUser): Promise<void> {
    const stripe = this.stripeApiService.getStripe();

    const userPlan = await this.userPlanRepo.getActiveForUser(user);

    const tariff = await this.tariffRepo.findOne({
      where: { id: user.tariffId },
    });

    const card = await this.userCardRepo.getDefaultCardForUser(user.id);

    const newPaymentIntent = await stripe.paymentIntents.create({
      amount: tariff.price * 100,
      currency: DEFAULT_CURRENCY,
      customer: user.stripeCustomerId,
      automatic_payment_methods: {
        enabled: true,
      },
      setup_future_usage: 'off_session',
    });

    await this.billingTransactionRepo.save({
      userId: user.id,
      cardId: card?.id,
      amount: tariff.price * 100,
      userPlanId: userPlan.id,
      paymentProvider: PaymentProvider.STRIPE,
      type: BillingTransactionType.SUBSCRIPTION,
      status: BillingTransactionStatus.FAILED,
      refundable: false,
      tariffId: user.tariffId,
      paymentPayload: {
        paymentIntentId: 'pi_fake',
        newPaymentIntentId: newPaymentIntent.client_secret,
      },
    });
  }
}
