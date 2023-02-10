import { EntityRepository, IsNull, Not, Repository } from 'typeorm';
import { UserStatus } from '../../../authnode-api/types/user-status.enum';
import { UserEntity } from '../entities/user.authnode-entity';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  async getOverallStatistics(params: {
    searchValue: string;
    corporateOnly: 'true' | 'false' | '';
  }): Promise<{
    trialCount: number;
    activeCount: number;
    expiredCount: number;
    paymentRequiredCount: number;
    unsubscribedCount: number;
    suspendedCount: number;
    blockedCount: number;
    deletedCount: number;
    totalCount: number;
  }> {
    const { searchValue, corporateOnly } = params;

    const requests = [
      UserStatus.Trial,
      UserStatus.Active,
      UserStatus.Expired,
      UserStatus.PaymentRequired,
      UserStatus.Unsubscribed,
      UserStatus.Suspended,
      UserStatus.Blocked,
      UserStatus.Deleted,
    ].map(async (status) => {
      let requestBuilder = this.createQueryBuilder('users');

      requestBuilder = requestBuilder.andWhere(
        `(LOWER(users.name) LIKE '%${searchValue}%' OR LOWER(users.last_name) LIKE '%${searchValue}%' OR LOWER(users.email) LIKE '%${searchValue}%')`,
      );

      if (corporateOnly === 'true') {
        requestBuilder = requestBuilder.andWhere(
          'users.company_id IS NOT NULL',
        );
      }

      return requestBuilder.andWhere({ status }).getCount();
    });

    const counts = await Promise.all(requests);

    const [
      trialCount,
      activeCount,
      expiredCount,
      paymentRequiredCount,
      unsubscribedCount,
      suspendedCount,
      blockedCount,
      deletedCount,
    ] = counts;

    return {
      trialCount,
      activeCount,
      expiredCount,
      paymentRequiredCount,
      unsubscribedCount,
      suspendedCount,
      blockedCount,
      deletedCount,
      totalCount: counts.reduce((a, b) => a + b),
    };
  }
}
