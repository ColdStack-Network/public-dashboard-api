import { EntityRepository, Repository } from 'typeorm';
import { BandwidthUsageEntity } from '../entities/bandwidth-usage.filenode-entity';
import moment from 'moment';

@EntityRepository(BandwidthUsageEntity)
export class BandwidthUsageRepository extends Repository<BandwidthUsageEntity> {
  async getBandwidthUsageOfUser(userId: string): Promise<string> {
    const res: { sum: string } = await this.createQueryBuilder('bandwidth')
      .select('sum(bandwidth.size)')
      .where('bandwidth."userId" = :userId', { userId })
      .getRawOne();

    return res.sum;
  }

  async aggregateByDays(params: {
    userId: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<{ date: string; download: string; upload: string }[]> {
    const qb = this.createQueryBuilder('bandwidth_usage')
      .select('SUM(size) as bandwidth, DATE("createdAt") as date, type')
      .where('"userId" = :userId', { userId: params.userId });

    if (params.fromDate && moment(params.fromDate).isValid()) {
      qb.andWhere('"createdAt" >= :fromDate', { fromDate: params.fromDate });
    }

    if (params.toDate && moment(params.toDate).isValid()) {
      qb.andWhere('"createdAt" < :toDate', { toDate: params.toDate });
    }

    const res: {
      bandwidth: string;
      date: Date;
      type: 'upload' | 'download';
    }[] = await qb
      .groupBy('DATE("createdAt"), type')
      .orderBy('date', 'ASC')
      .getRawMany();

    const result: { date: string; download: string; upload: string }[] = [];

    res.forEach((row) => {
      if (!result.length) {
        result.push({
          date: moment(row.date).format('YYYY-MM-DD'),
          download: row.type === 'download' ? row.bandwidth : '0',
          upload: row.type === 'upload' ? row.bandwidth : '0',
        });
      } else {
        const last = result[result.length - 1];

        if (last.date === moment(row.date).format('YYYY-MM-DD')) {
          if (row.type === 'download') {
            last.download = row.bandwidth;
          } else if (row.type === 'upload') {
            last.upload = row.bandwidth;
          }
        } else {
          result.push({
            date: moment(row.date).format('YYYY-MM-DD'),
            download: row.type === 'download' ? row.bandwidth : '0',
            upload: row.type === 'upload' ? row.bandwidth : '0',
          });
        }
      }
    });

    return result;
  }
}
