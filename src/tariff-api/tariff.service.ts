import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TariffRepository } from './repositories/tariffs.repository';
import { TariffDto } from './dto/tariff.dto';
import { UserPlanRepository } from './repositories/userPlan.repository';
import { UserPlanDto } from './dto/userPlan.dto';
import { IUser } from '../authnode-api/interfaces/user.interface';
import { UserPlanEntity } from './entities/userPlan.entity';
import { AuthnodeApiService } from '../authnode-api/authnode-api.service';
import { TariffsEntity } from './entities/tariffs.entity';
import { UserStatus } from '../authnode-api/types/user-status.enum';
import { UserCardRepository } from '../stripe-api/repositories/user-card.repository';
import { StripeApiService } from '../stripe-api/stripe-api.service';
import { MoreThan } from 'typeorm';
import { CommonService } from '../common/common.service';
import { BillingTransactionType } from '../billing-api/types/billing-transaction-type.enum';
import { BillingTransactionRepository } from '../billing-api/repositories/billing-transaction.repository';
import { BillingTransactionStatus } from '../billing-api/types/billing-transaction-status.enum';

@Injectable()
export class TariffService {
  constructor(
    @InjectRepository(BillingTransactionRepository, 'default')
    private readonly billingTransactionRepo: BillingTransactionRepository,
    @InjectRepository(TariffRepository, 'default')
    private readonly tariffRepo: TariffRepository,
    @InjectRepository(UserPlanRepository, 'default')
    private readonly userPlanRepo: UserPlanRepository,
    private readonly authnodeApiService: AuthnodeApiService,
    @InjectRepository(UserCardRepository, 'default')
    private readonly userCardRepo: UserCardRepository,
    private readonly stripeApiService: StripeApiService,
    private readonly commonService: CommonService,
  ) {}

  public async getAll(): Promise<TariffDto[]> {
    const rep = await this.tariffRepo.getTariffs();
    return rep.map((x) => new TariffDto(x));
  }

  public async getUserPlan(user: IUser): Promise<UserPlanDto> {
    const ent = await this.userPlanRepo.getCurrentUserPlan(user);

    if (!ent) {
      throw new NotFoundException('User plan not found');
    }

    const failedBillingTransaction = await this.billingTransactionRepo.findOne({
      where: {
        userId: user.id,
        userPlanId: ent.id,
        status: BillingTransactionStatus.FAILED,
      },
    });

    let failedTransactionPaymentIntentId;

    if (failedBillingTransaction) {
      failedTransactionPaymentIntentId =
        failedBillingTransaction.paymentPayload.newPaymentIntentId;
    }

    const userPlan = new UserPlanDto(ent);
    userPlan.failedTransactionPaymentIntentId =
      failedTransactionPaymentIntentId;

    return userPlan;
  }

  public async changeUserPlan(
    user: IUser,
    tariffId: number,
  ): Promise<{ userPlan: UserPlanEntity; transactionId: string }> {
    const tariff = await this.tariffRepo.findOneOrFail({
      where: { id: tariffId },
    });

    const userHasPlan = await this.userPlanRepo.findOne({
      where: { user_id: user.id },
    });

    if (!userHasPlan) {
      return await this.stripeApiService.subscribe({
        user,
        tariffId: tariff.id,
        shouldCreateNewUserPlan: true,
      });
    }

    if (user.status === UserStatus.Trial) {
      return await this.applyTrialFlow(user, tariff);
    }

    return await this.switchToANewPlan(user, tariff);
  }

  public async cancelNextTariff(user: IUser): Promise<void> {
    const currentTariff = await this.tariffRepo.findOne({
      where: {
        id: user.tariffId,
      },
    });

    const nextTariff = await this.tariffRepo.findOne({
      where: {
        id: user.nextTariffId,
      },
    });

    if (!nextTariff) {
      throw new Error('Next tariff does not exist');
    }

    const userPlan = await this.userPlanRepo.findOne({
      order: { id: 'DESC' },
      where: {
        user_id: user.id,
        tariff_id: nextTariff.id,
        active: false,
        created_at: MoreThan(new Date()),
      },
    });

    if (userPlan) {
      await this.userPlanRepo.delete({
        id: userPlan.id,
      });

      await this.stripeApiService.deleteSubscriptions(user);

      await this.stripeApiService.createSubscriptionForTariff(
        user,
        currentTariff,
      );

      await this.authnodeApiService.deleteUserNextTariffId(user.id);
    }
  }

  private async applyTrialFlow(
    user: IUser,
    tariff: TariffsEntity,
  ): Promise<{ userPlan: UserPlanEntity; transactionId: string }> {
    const defaultUserCard = await this.userCardRepo.getDefaultCardForUser(
      user.id,
    );

    if (defaultUserCard) {
      return this.stripeApiService.subscribe({
        user,
        tariffId: tariff.id,
        shouldCreateNewUserPlan: true,
      });
    }
  }

  async setTrialUserPlan(
    userId: string,
  ): Promise<{ userPlan: UserPlanEntity; transactionId: string }> {
    const user = await this.authnodeApiService.getUserById(userId);

    const defaultUserCard = await this.userCardRepo.getDefaultCardForUser(
      user.id,
    );

    if (!defaultUserCard) throw new Error('User card not found');

    const tariffId =
      user.tariffId ||
      (user.companyId
        ? this.commonService.getDefaultTariffIdForCompany()
        : this.commonService.getDefaultTariffId());

    return await this.stripeApiService.subscribe({
      user,
      tariffId,
      shouldCreateNewUserPlan: true,
    });
  }

  private async switchToANewPlan(
    user: IUser,
    tariff: TariffsEntity,
  ): Promise<{ userPlan: UserPlanEntity; transactionId: string }> {
    const currentUserPlan = await this.userPlanRepo.getActiveForUser(user);
    const futureUserPlan = await this.userPlanRepo.getLastForUser(user.id);

    if (currentUserPlan.id !== futureUserPlan.id) {
      await this.userPlanRepo.delete({
        id: futureUserPlan.id,
      });
    }

    const { userPlan, transactionId } = await this.stripeApiService.subscribe({
      user,
      tariffId: tariff.id,
      shouldCreateNewUserPlan: true,
      subscriptionType: BillingTransactionType.DELAYED_SUBSCRIPTION,
    });

    return { userPlan, transactionId };
  }

  public async initializeUser(user: IUser): Promise<void> {
    const userPlansCount = await this.userPlanRepo.count({
      where: { user_id: user.id },
    });

    if (userPlansCount > 0) {
      return;
    }

    const customer = await this.stripeApiService.initCustomer(user.id);

    await this.authnodeApiService.updateStripeCustomerId(user.id, customer.id);

    const tariff = await this.tariffRepo.findOne({
      where: { id: user.tariffId },
    });

    await this.userPlanRepo.createForUser({
      user,
      tariff,
      active: true,
    });
  }
}
