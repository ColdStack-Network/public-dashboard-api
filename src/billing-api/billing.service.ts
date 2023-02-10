import { Injectable } from '@nestjs/common';
import { IUser } from '../authnode-api/interfaces/user.interface';
import { EntityManager, In, MoreThan, Not } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { TariffService } from '../tariff-api/tariff.service';
import { UsageDto } from './dto/billing.dto';
import { BillingTransactionRepository } from './repositories/billing-transaction.repository';
import { BillingTransactionDto } from './dto/billing-transaction.dto';
import { GetBillingTransactionsRequestQueryDto } from './dto/get-billing-transactions-query.dto';
import { GetBillingTransactionsResponseDto } from './dto/get-billing-transactions-response.dto';
import { BillingTransactionStatus } from './types/billing-transaction-status.enum';
import { StripeApiService } from '../stripe-api/stripe-api.service';
import { BillingTransactionEntity } from './entities/billing-transaction.entity';
import { BillingTransactionType } from './types/billing-transaction-type.enum';
import { UserStatus } from '../authnode-api/types/user-status.enum';
import { AuthnodeApiService } from '../authnode-api/authnode-api.service';
import { PaymentStatusDto } from './dto/payment-status.sto';
import { Cron } from '@nestjs/schedule';
import { UserPlanRepository } from '../tariff-api/repositories/userPlan.repository';
import { TariffRepository } from '../tariff-api/repositories/tariffs.repository';
import moment from 'moment';

@Injectable()
export class BillingSevice {
  constructor(
    @InjectEntityManager('billing_db')
    private readonly manager: EntityManager,
    @InjectRepository(BillingTransactionRepository, 'default')
    private readonly billingTransactionRepo: BillingTransactionRepository,
    @InjectRepository(UserPlanRepository, 'default')
    private readonly userPlanRepo: UserPlanRepository,
    @InjectRepository(TariffRepository, 'default')
    private readonly tariffRepo: TariffRepository,
    private readonly tariffService: TariffService,
    private readonly stripeApiService: StripeApiService,
    private readonly authnodeApiService: AuthnodeApiService,
  ) {}

  @Cron('00 00 * * *')
  async checkUserPlan() {
    const activeUsers = await this.authnodeApiService.getActiveUsers();

    activeUsers.forEach(async ({ userId, tariffId }) => {
      const user: IUser = await this.authnodeApiService.getUserById(userId);

      let userPlan = await this.userPlanRepo.getActiveForUser(user);

      if (!userPlan) {
        const lastUserPlan = await this.userPlanRepo.getLastForUser(userId);

        const tariff = await this.tariffRepo.findOne({
          where: { id: tariffId },
        });

        userPlan = await this.userPlanRepo.createForUser({
          user,
          tariff,
          startDate: lastUserPlan.end_at,
        });

        await this.userPlanRepo.activatePlan(userId, userPlan.id);
      } else {
        const today = moment();
        const planEndsAt = moment(userPlan.end_at);
        const daysDifferece = planEndsAt.diff(today, 'days');

        if (daysDifferece <= 7 && daysDifferece < 0) {
          await this.authnodeApiService.updateUserStatus(
            user.id,
            UserStatus.PaymentRequired,
          );
        } else if (daysDifferece === 0) {
          await this.authnodeApiService.updateUserStatus(
            user.id,
            UserStatus.Expired,
          );
        } else if (daysDifferece < 0 && daysDifferece <= -7) {
          await this.authnodeApiService.updateUserStatus(
            user.id,
            UserStatus.Suspended,
          );
        }
      }

      if (tariffId !== userPlan.tariff_id) {
        await this.authnodeApiService.updateUserTariffId(
          userId,
          userPlan.tariff_id,
        );

        if (userPlan.tariff_id === user.nextTariffId) {
          await this.authnodeApiService.deleteUserNextTariffId(userId);
        }
      }
    });
  }

  async getStorageUsage(user: IUser) {
    const rep: Array<{ sum: string }> = await this.manager.query(
      `
      SELECT SUM(f.file_size_bytes) FROM files f
      WHERE f.user_id = $1 and f.is_deleted = false;
    `,
      [user.id],
    );
    const sum = rep?.[0].sum || '0';

    return new UsageDto(sum);
  }

  async getBandwidthUsage(user: IUser) {
    const { created_at, end_at } = await this.tariffService.getUserPlan(user);

    const bandwith: Array<{ sum: string }> = await this.manager.query(
      `
        SELECT SUM(b.bytes) from (
          SELECT fe.event, fe.created_at, fe.bytes from file_events fe 
          LEFT JOIN files f ON f.file_id = fe.file_id
          WHERE f.user_id = $1 AND fe."event" != 'delete' AND ( fe.created_at >= $2 AND fe.created_at <= $3)
        ) as b;
    `,
      [user.id, created_at, end_at],
    );

    const sum = bandwith?.[0].sum || '0';

    return new UsageDto(sum);
  }

  async getBillingHistory(
    user: IUser,
    query: GetBillingTransactionsRequestQueryDto,
  ): Promise<GetBillingTransactionsResponseDto> {
    const invoices = await this.stripeApiService.getInvoicesForCustomer(
      user.stripeCustomerId,
    );

    const billingTransactions =
      await this.billingTransactionRepo.getWithExistingPlans({
        userId: user.id,
        type: BillingTransactionType.SUBSCRIPTION,
      });

    const billingTransactionsIds = billingTransactions.map(({ id }) => id);

    const mapItems = (tx: BillingTransactionEntity): BillingTransactionDto => {
      const invoiceObject = tx.paymentPayload?.paymentIntentId
        ? invoices.data.find(
            (invoice) =>
              invoice.payment_intent === tx.paymentPayload?.paymentIntentId,
          )
        : null;

      const dto = new BillingTransactionDto(tx);
      dto.invoiceId = invoiceObject?.id || null;
      dto.downloadPdfLink = invoiceObject?.invoice_pdf || null;

      return dto;
    };

    const stats = await this.billingTransactionRepo.getOverallStatistics(
      user.id,
    );

    if (query.id) {
      const perPage = +query.perPage || 10;

      const countBefore = await this.billingTransactionRepo.count({
        where: {
          userId: user.id,
          id: MoreThan(query.id),
        },
      });

      const skip = countBefore - (countBefore % perPage);

      const txs = await this.billingTransactionRepo.find({
        relations: ['userPlan', 'userCard', 'userPlan.tariff'],
        where: {
          userId: user.id,
          type: BillingTransactionType.SUBSCRIPTION,
          id: In(billingTransactionsIds),
          status: Not(BillingTransactionStatus.CANCELED),
        },
        skip,
        take: perPage,
        order: {
          createdAt: 'DESC',
        },
      });

      return new GetBillingTransactionsResponseDto({
        items: txs.map(mapItems),
        totalCount: stats.totalCount,
        successCount: stats.successCount,
        pendingCount: stats.pendingCount,
        failedCount: stats.failedCount,
        page: query.page || Math.ceil(skip / perPage) + 1,
        perPage: perPage,
        pagesCount: Math.ceil(stats.totalCount / perPage),
      });
    }

    const page = +query.page || 1;
    const perPage = +query.perPage || 10;

    let groupCount;
    switch (query.group) {
      case BillingTransactionStatus.SUCCESS:
        groupCount = stats.successCount;
        break;
      case BillingTransactionStatus.PENDING:
        groupCount = stats.pendingCount;
        break;
      case BillingTransactionStatus.FAILED:
        groupCount = stats.failedCount;
        break;
      default:
        groupCount = stats.totalCount;
        break;
    }

    const txs = await this.billingTransactionRepo.find({
      relations: ['userPlan', 'userCard', 'userPlan.tariff'],
      where: {
        userId: user.id,
        type: BillingTransactionType.SUBSCRIPTION,
        status: Not(BillingTransactionStatus.CANCELED),
        id: In(billingTransactionsIds),
        ...(query.group ? { status: query.group } : {}),
      },
      take: perPage,
      skip: (page - 1) * perPage,
      order: {
        createdAt: 'DESC',
      },
    });

    return new GetBillingTransactionsResponseDto({
      items: txs.map(mapItems),
      totalCount: stats.totalCount,
      successCount: stats.successCount,
      pendingCount: stats.pendingCount,
      failedCount: stats.failedCount,
      page: page,
      perPage: perPage,
      pagesCount: Math.ceil(groupCount / perPage),
    });
  }

  async deleteSubscriptions(user: IUser): Promise<void> {
    await this.stripeApiService.deleteSubscriptions(user);

    await this.authnodeApiService.updateUserStatus(
      user.id,
      UserStatus.Unsubscribed,
    );
  }

  async renovateSubscription(user: IUser): Promise<void> {
    await this.stripeApiService.renovateSubscription(user);

    await this.authnodeApiService.updateUserStatus(user.id, UserStatus.Active);
  }

  async getBillingTransactionPaymentStatus(
    transactionId: string,
  ): Promise<PaymentStatusDto> {
    if (transactionId.startsWith('pi_')) {
      const result = await this.billingTransactionRepo.query(
        `
        SELECT * FROM billing_transactions
        WHERE billing_transactions.payment_payload->>'paymentIntentId' = $1 OR
        billing_transactions.payment_payload->>'newPaymentIntentId' LIKE '%${transactionId}%'
        LIMIT 1`,
        [transactionId],
      );

      return result && result.length ? result[0] : null;
    } else {
      return await this.billingTransactionRepo.findOne({
        where: {
          id: transactionId,
        },
      });
    }
  }
}
