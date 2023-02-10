import { EntityRepository, In, Not, Repository } from 'typeorm';
import { PaymentStatusDto } from '../dto/payment-status.sto';
import { BillingTransactionEntity } from '../entities/billing-transaction.entity';
import { BillingTransactionStatus } from '../types/billing-transaction-status.enum';
import { BillingTransactionType } from '../types/billing-transaction-type.enum';
import { PaymentProvider } from '../types/payment-provider.enum';

@EntityRepository(BillingTransactionEntity)
export class BillingTransactionRepository extends Repository<BillingTransactionEntity> {
  async getByUserId(userId: string): Promise<BillingTransactionEntity[]> {
    return this.find({
      where: { userId },
    });
  }

  async getUnfinishedDelayedSubscription(params: {
    userId: string;
  }): Promise<BillingTransactionEntity> {
    const { userId } = params;

    return this.findOne({
      where: {
        userId,
        status: BillingTransactionStatus.PENDING,
        type: In([
          BillingTransactionType.SUBSCRIPTION,
          BillingTransactionType.DELAYED_SUBSCRIPTION,
        ]),
      },
    });
  }

  async getUnfinishedByPaymentPayload(params: {
    userId: string;
    paymentPayload: { field: string; value: string };
  }): Promise<any> {
    const { userId, paymentPayload } = params;

    const result = await this.query(
      `SELECT * FROM billing_transactions WHERE user_id = $1 AND status = $2 AND billing_transactions.payment_payload->>'${paymentPayload.field}' = $3 limit 1`,
      [userId, BillingTransactionStatus.PENDING, paymentPayload.value],
    );

    if (result && result.length) {
      return result[0];
    } else {
      throw new Error(
        `Failed to fetch billing transaction for user ${userId}. payment payload: ${JSON.stringify(
          paymentPayload,
        )}`,
      );
    }
  }

  async getStatusByPaymentIntentId(id): Promise<PaymentStatusDto> {
    const result = await this.query(
      `SELECT * FROM billing_transactions WHERE billing_transactions.payment_payload->>'paymentIntentId' = $1 limit 1`,
      [id],
    );

    if (result && result.length) {
      const status = result[0].status;

      let reason = null;

      if (status === BillingTransactionStatus.FAILED) {
        try {
          const { errors } = result[0];

          reason = errors
            ? JSON.parse(errors)?.message
            : 'Something went wrong';
        } catch (e) {
          reason = 'Something went wrong';
        }
      }

      return { status, reason };
    } else {
      throw new Error(`Billing transaction with id ${id} does not exist.`);
    }
  }

  async getUnfinishedByType(params: {
    userId: string;
    tariffId: number;
    type: BillingTransactionType;
  }): Promise<BillingTransactionEntity> {
    const { userId, type, tariffId } = params;

    return this.findOne({
      where: {
        userId,
        type,
        tariffId,
        status: BillingTransactionStatus.PENDING,
      },
    });
  }

  async finishTransaction(params: {
    paymentIntentId: string;
    newPaymentIntentId?: string;
    payload: Record<string, any>;
  }): Promise<void> {
    const { paymentIntentId, payload } = params;

    const tx = await this.getByPaymentIntentId(paymentIntentId);

    await this.manager.connection
      .createQueryBuilder()
      .update(BillingTransactionEntity)
      .set(payload)
      .where({ id: tx.id })
      .execute();
  }

  async finishTransaction_Old(params: {
    userId: string;
    cardId: string;
    userPlanId?: number;
    paymentPayload: { field: string; value: string };
    paymentProvider: PaymentProvider;
    status: BillingTransactionStatus;
    errors?: any;
  }): Promise<void> {
    const {
      userId,
      cardId,
      userPlanId,
      paymentPayload,
      paymentProvider,
      status,
      errors,
    } = params;

    await this.manager.connection
      .createQueryBuilder()
      .update(BillingTransactionEntity)
      .set({ status: BillingTransactionStatus.CANCELED })
      .where({
        userId,
        status: BillingTransactionStatus.PENDING,
        type: Not(BillingTransactionType.CARD_VALIDATION),
      })
      .execute();

    const payload = {
      userId,
      cardId,
      status,
      errors,
    };

    if (userPlanId) {
      payload['userPlanId'] = userPlanId;
    }

    await this.manager.connection
      .createQueryBuilder()
      .update(BillingTransactionEntity)
      .set(payload)
      .where({ userId, paymentProvider })
      .andWhere(
        `billing_transactions.payment_payload->>'${paymentPayload.field}' = :id`,
        {
          id: paymentPayload.value,
        },
      )
      .execute();
  }

  findAllByUser(userId: string): Promise<BillingTransactionEntity[]> {
    return this.find({
      relations: ['userPlan', 'userCard', 'userPlan.tariff'],
      where: { userId },
    });
  }

  async getOverallStatistics(userId: string): Promise<{
    successCount: number;
    pendingCount: number;
    failedCount: number;
    totalCount: number;
  }> {
    const [successCount, pendingCount, failedCount] = await Promise.all([
      this.count({
        where: {
          status: BillingTransactionStatus.SUCCESS,
          userId: userId,
        },
      }),
      this.count({
        where: {
          status: BillingTransactionStatus.PENDING,
          userId: userId,
        },
      }),
      this.count({
        where: {
          status: BillingTransactionStatus.FAILED,
          userId: userId,
        },
      }),
    ]);

    return {
      successCount,
      pendingCount,
      failedCount,
      totalCount: successCount + pendingCount + failedCount,
    };
  }

  getPending(params: {
    userId: string;
    tariffId: number;
    type: BillingTransactionType;
  }): Promise<BillingTransactionEntity> {
    const { userId, tariffId, type } = params;

    return this.findOne({
      where: {
        userId,
        tariffId,
        status: BillingTransactionStatus.PENDING,
        type,
      },
    });
  }

  async cancelPendingDelayedSubscriptions(userId): Promise<void> {
    await this.update(
      {
        userId,
        type: BillingTransactionType.SUBSCRIPTION,
        status: BillingTransactionStatus.PENDING,
      },
      {
        status: BillingTransactionStatus.CANCELED,
      },
    );
  }

  getWithExistingPlans(params: {
    userId: string;
    type: BillingTransactionType;
  }): Promise<BillingTransactionEntity[]> {
    const { userId, type } = params;

    return this.createQueryBuilder('t')
      .select(['t.id'])
      .leftJoin('t.userPlan', 'p')
      .where({
        userId,
        type,
      })
      .getMany();
  }

  getByPaymentIntentId(
    paymentIntentId: string,
  ): Promise<BillingTransactionEntity> {
    const params = {
      paymentIntentId: `%${paymentIntentId}%`,
    };

    return this.createQueryBuilder('billing_transactions')
      .where(
        `billing_transactions.payment_payload->>'paymentIntentId' LIKE :paymentIntentId`,
        params,
      )
      .orWhere(
        `billing_transactions.payment_payload->>'newPaymentIntentId' LIKE :paymentIntentId`,
        params,
      )
      .getOne();
  }
}
