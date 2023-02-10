import moment from 'moment';
import { EntityRepository, LessThan, Repository } from 'typeorm';
import { StorageUsageEntity } from '../entities/storage-usage.filenode-entity';

@EntityRepository(StorageUsageEntity)
export class StorageUsageRepository extends Repository<StorageUsageEntity> {
  async aggregateStorageUsageAnalyticsForUser(params: {
    userId: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<{ sizeSum: string; createdAt: Date }[]> {
    const storageUsageByBuckets = this.createQueryBuilder('storage_usage')
      .select(
        'MAX(storage_usage.size) as "sizeSum", to_char(storage_usage."createdAt", \'YYYY-MM-DD\') as "createdAt", storage_usage."bucketId"',
      )
      .where('storage_usage."userId" = :userId', {
        userId: params.userId,
      });

    if (params.fromDate && moment(params.fromDate).isValid()) {
      storageUsageByBuckets.andWhere('storage_usage."createdAt" >= :fromDate', {
        fromDate: params.fromDate,
      });
    }

    if (params.toDate && moment(params.toDate).isValid()) {
      storageUsageByBuckets.andWhere('storage_usage."createdAt" < :toDate', {
        toDate: params.toDate,
      });
    }

    storageUsageByBuckets
      .groupBy('storage_usage."createdAt"')
      .addGroupBy('"bucketId"');

    const storageUsage: { sizeSum: string; createdAt: Date }[] =
      await this.manager.connection
        .createQueryBuilder()
        .select(
          'SUM(storage_usage_by_buckets."sizeSum") AS "sizeSum", storage_usage_by_buckets."createdAt"',
        )
        .from(
          '(' + storageUsageByBuckets.getQuery() + ')',
          'storage_usage_by_buckets',
        )
        .setParameters(storageUsageByBuckets.getParameters())
        .groupBy('storage_usage_by_buckets."createdAt"')
        .orderBy('storage_usage_by_buckets."createdAt"', 'ASC')
        .getRawMany();

    return storageUsage;
  }

  async getLastStorageStatisticsRecord(
    beforeDate: Date,
    userId: string,
  ): Promise<{ sizeSum: string; createdAt: Date } | null> {
    const lastRecordBeforeSpecifiedDate = await this.findOne({
      where: {
        createdAt: LessThan(beforeDate),
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!lastRecordBeforeSpecifiedDate) {
      return null;
    }

    const lastRecordDate = moment(lastRecordBeforeSpecifiedDate.createdAt)
      .startOf('day')
      .toDate();

    const [{ sizeSum }] = await this.query(
      `
        SELECT SUM(storage_usage_by_buckets."sizeSum") AS "sizeSum"
        FROM (
          SELECT 
            MAX(storage_usage.size) as "sizeSum", storage_usage."bucketId"
          FROM storage_usage
          WHERE
            storage_usage."userId" = $1 AND
            storage_usage."createdAt" >= $2 AND
            storage_usage."createdAt" < $3
          GROUP BY storage_usage."bucketId"
        ) AS storage_usage_by_buckets;
      `,
      [
        userId,
        lastRecordDate.toISOString(),
        moment(lastRecordDate).add(1, 'day').toISOString(),
      ],
    );

    return {
      createdAt: lastRecordDate,
      sizeSum,
    };
  }
}
