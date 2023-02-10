import { forwardRef, Inject, Injectable } from '@nestjs/common';
import prettyBytes from 'pretty-bytes';
import moment from 'moment';
import BN from 'bignumber.js';
import { InjectRepository } from '@nestjs/typeorm';
import { BucketRepository } from '../../statistics/repositories/bucket.repository';
import { ObjectRepository } from '../../statistics/repositories/object.repository';
import { BandwidthUsageRepository } from '../../statistics/repositories/bandwidth-usage.repository';
import { StorageUsageRepository } from '../../statistics/repositories/storage-usage.repository';
import { ObjectVersionsRepository } from '../../statistics/repositories/object-versions.repository';
import { AuthnodeApiService } from '../../authnode-api/authnode-api.service';
import { StorageAnalyticsResponseFormatter } from '../../statistics/response-formatters/StorageAnalytics';
import { StatisticsResponseDto } from '../../statistics/dto/statistics-response.dto';
import { GetBandwidthAnalyticsRequestQueryDto } from '../../statistics/dto/get-bandwidth-analytics-request-query.dto';
import { BandwidthAnalyticsResponseDto } from '../../statistics/dto/bandwidth-analytics-response.dto';
import { GetStorageAnalyticsRequestQueryDto } from '../../statistics/dto/get-storage-analytics-request-query.dto';
import { StorageAnalyticsResponseDto } from '../../statistics/dto/storage-analytics-response.dto';
import { GetStatsForLandingResponseDto } from '../../statistics/dto/get-stats-for-landing-response.dto';
import { CommonStatisticsResponseDto } from './dto/common-statistics-response.dto';
import { UserPlanRepository } from '../../tariff-api/repositories/userPlan.repository';
import { LessThan } from 'typeorm';
import { UserRepository } from '../users/repositories/user.repository';
import { UserStatus } from '../../authnode-api/types/user-status.enum';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(UserRepository, 'authnode_db')
    private readonly usersRepo: UserRepository,
    @InjectRepository(BucketRepository, 'filenode_db')
    private readonly bucketRepo: BucketRepository,
    @InjectRepository(ObjectRepository, 'filenode_db')
    private readonly objectRepo: ObjectRepository,
    @InjectRepository(BandwidthUsageRepository, 'filenode_db')
    private readonly bandwidthUsageRepo: BandwidthUsageRepository,
    @InjectRepository(StorageUsageRepository, 'filenode_db')
    private readonly storageUsageRepo: StorageUsageRepository,
    @InjectRepository(ObjectVersionsRepository, 'filenode_db')
    private readonly objectVersionsRepo: ObjectVersionsRepository,
    @InjectRepository(UserPlanRepository, 'default')
    private readonly userPlanRepo: UserPlanRepository,
    @Inject(forwardRef(() => AuthnodeApiService))
    private readonly authnodeApiService: AuthnodeApiService,
    private readonly storageAnalyticsResponseFormatter: StorageAnalyticsResponseFormatter,
  ) {}

  async getCommonStatistics(): Promise<CommonStatisticsResponseDto> {
    const { objectsCount, usedStorage } =
      await this.objectVersionsRepo.getAllObjectVersionsCountAndSizeSum();

    const usersCount = await this.authnodeApiService.getUsersCount();

    const activeTariffs = await this.usersRepo.count({
      where: {
        status: UserStatus.Active,
      },
    });

    const unpaidTariffs = await this.usersRepo.count({
      where: {
        status: UserStatus.PaymentRequired,
      },
    });

    const suspendedTariffs = await this.usersRepo.count({
      where: {
        status: UserStatus.Suspended,
      },
    });

    const stats = {
      storedObjectsCount: +objectsCount,
      totalUsersCount: usersCount,
      usedStorage: usedStorage,
      usedStorageReadable: prettyBytes(+usedStorage),
      activeTariffs,
      unpaidTariffs,
      suspendedTariffs,
    };

    return stats;
  }

  /**
   * TODO: calculate object versions sizes
   */
  async getStatistics(userId: string): Promise<StatisticsResponseDto> {
    // Fix in Filenode to use with user IDs
    const buckets = await this.bucketRepo.getByOwnerUserId(userId);

    const bucketsNames = buckets.map((b) => b.name);
    const bucketsIds = buckets.map((b) => b.id);

    const objectsCount = await this.objectRepo.getOverallObjectsCountInBuckets(
      bucketsNames,
      true,
    );

    const objectsSizeSum =
      await this.objectVersionsRepo.getObjectVersionsSizeSumInBucketIds(
        bucketsIds,
      );

    const bandwidthUsage =
      // Fix in Filenode to use with user IDs
      await this.bandwidthUsageRepo.getBandwidthUsageOfUser(userId);

    const prettyStorageUsage = this.prettyBytes(objectsSizeSum);

    const prettyBandwidthUsage = this.prettyBytes(bandwidthUsage);

    const result: StatisticsResponseDto = {
      Statistics: {
        Buckets: {
          Count: buckets.length,
        },
        Objects: {
          Count: objectsCount,
        },
        UsedStorage: {
          UsedStorageBytes: objectsSizeSum,
          UsedStorageReadableQuantity: prettyStorageUsage.quantity,
          UsedStorageReadableUnit: prettyStorageUsage.unit,
        },
        Bandwidth: {
          BandwidthBytes: bandwidthUsage,
          BandwidthReadableQuantity: prettyBandwidthUsage.quantity,
          BandwidthReadableUnit: prettyBandwidthUsage.unit,
        },
      },
    };

    return result;
  }

  async getBandwidthAnalytics(
    query: GetBandwidthAnalyticsRequestQueryDto,
    userId: string,
  ): Promise<BandwidthAnalyticsResponseDto> {
    const user = await this.authnodeApiService.getUserById(userId);

    const availableBandwidthRecords =
      await this.bandwidthUsageRepo.aggregateByDays({
        // Fix in Filenode to use with user IDs
        userId: user.id,
        fromDate: query.fromDate ? new Date(query.fromDate as any) : null,
        toDate: query.toDate ? new Date(query.toDate as any) : null,
      });

    const analytics = this.addDaysWithZeroBandwidth(availableBandwidthRecords, {
      fromDate: query.fromDate,
      toDate: query.toDate,
      userCreationDate: new Date(user.createdAt),
    });

    const result: BandwidthAnalyticsResponseDto = {
      BandwidthAnalytics: {
        Records: analytics.map((row) => ({
          Date: row.date,
          DownloadBandwidth: row.download,
          DownloadBandwidthReadable: prettyBytes(parseInt(row.download)),
          UploadBandwidth: row.upload,
          UploadBandwidthReadable: prettyBytes(parseInt(row.upload)),
          TotalBandwidth: new BN(row.upload).plus(row.download).toString(),
          TotalBandwidthReadable: prettyBytes(
            new BN(row.upload).plus(row.download).toNumber(),
          ),
        })),
      },
    };

    return result;
  }

  private addDaysWithZeroBandwidth(
    availableBandwidthRecords: {
      date: string;
      upload: string;
      download: string;
    }[],
    params: { fromDate?: any; toDate?: any; userCreationDate: Date },
  ): { date: string; upload: string; download: string }[] {
    const fromDate =
      params.fromDate && moment(params.fromDate).isValid()
        ? moment(params.fromDate)
        : moment(params.userCreationDate);
    const toDate =
      params.toDate && moment(params.toDate).isValid()
        ? moment(params.toDate)
        : availableBandwidthRecords.length
        ? moment(
            availableBandwidthRecords[availableBandwidthRecords.length - 1]
              .date,
          )
        : fromDate;

    const dateToBandwidthRecord: Record<
      string,
      { date: string; download: string; upload: string }
    > | null = {};
    let currentDate = fromDate.clone();
    while (currentDate <= toDate) {
      dateToBandwidthRecord[currentDate.format('YYYY-MM-DD')] = null;
      currentDate = currentDate.add(1, 'day');
    }

    availableBandwidthRecords.forEach((record) => {
      dateToBandwidthRecord[record.date] = record;
    });

    const bandwidthRecordsWithZeroDates: {
      date: string;
      download: string;
      upload: string;
    }[] = [];

    Object.keys(dateToBandwidthRecord)
      .map((date) => new Date(date))
      .sort((a, b) => a.valueOf() - b.valueOf())
      .forEach((date) => {
        const dateFormated = moment(date).format('YYYY-MM-DD');
        const existingRecord = dateToBandwidthRecord[dateFormated];

        bandwidthRecordsWithZeroDates.push(
          existingRecord || { date: dateFormated, upload: '0', download: '0' },
        );
      });

    return bandwidthRecordsWithZeroDates;
  }

  async getStorageAnalytics(
    query: GetStorageAnalyticsRequestQueryDto,
    userId: string,
  ): Promise<StorageAnalyticsResponseDto> {
    const results: Record<
      string,
      {
        timestamp: string;
        usedStorage: string;

        /**
         * Ксли true значит запись для заполнения дней без статистики.
         * Если в этот день записей статистики не было, значит объем хранимых данных не изменялся,
         * а значит можно взять размер хранимых данных предыдущего дня.
         */
        fillerRecord: boolean;
      }
    > = {};

    const analytics =
      await this.storageUsageRepo.aggregateStorageUsageAnalyticsForUser({
        // Fix in Filenode to use with user IDs
        userId,
        fromDate: query.fromDate ? new Date(query.fromDate as any) : null,
        toDate: query.toDate ? new Date(query.toDate as any) : null,
      });

    const fromDate = query.fromDate
      ? new Date(query.fromDate as any)
      : new Date(analytics[0] ? analytics[0].createdAt : Date.now() - 86400000);
    const toDate = query.toDate
      ? new Date(query.toDate as any)
      : new Date(
          analytics[analytics.length - 1]
            ? analytics[analytics.length - 1].createdAt
            : Date.now(),
        );

    const fromDateCounter = new Date(fromDate);
    while (fromDateCounter <= toDate) {
      results[
        fromDateCounter.getFullYear() +
          '-' +
          fromDateCounter.getMonth() +
          '-' +
          fromDateCounter.getDate()
      ] = {
        timestamp: fromDateCounter.toISOString(),
        usedStorage: '0',
        fillerRecord: true,
      };
      fromDateCounter.setDate(fromDateCounter.getDate() + 1);
    }

    analytics.forEach((record) => {
      const newDate = new Date(record.createdAt);
      const key =
        newDate.getFullYear() +
        '-' +
        newDate.getMonth() +
        '-' +
        newDate.getDate();
      if (results[key]) {
        results[key] = {
          timestamp: newDate.toISOString(),
          usedStorage: record.sizeSum,
          fillerRecord: false,
        };
      }
    });

    const keys = Object.keys(results);

    for (let i = 0; i < keys.length; i++) {
      const rec = results[keys[i]];

      if (i === 0 && rec.fillerRecord) {
        const lastRecord =
          await this.storageUsageRepo.getLastStorageStatisticsRecord(
            fromDate,
            // Fix in Filenode to use with user IDs
            userId,
          );

        if (lastRecord) {
          rec.usedStorage = lastRecord.sizeSum;
        }
      }

      if (
        i &&
        !parseInt(rec.usedStorage as string) &&
        parseInt(results[keys[i - 1]].usedStorage as string)
      ) {
        rec.usedStorage = results[keys[i - 1]].usedStorage;
      }
    }

    const resp = this.storageAnalyticsResponseFormatter.format(results);

    return resp;
  }

  private prettyBytes(bytes: string | number): {
    quantity: string;
    unit: string;
  } {
    const readableStorageUsage = prettyBytes(
      parseInt(bytes ? (bytes as string) : '0'),
    );

    return {
      quantity: readableStorageUsage.split(' ')[0],
      unit: readableStorageUsage.split(' ')[1],
    };
  }

  async getStatsForLandingPage(): Promise<GetStatsForLandingResponseDto> {
    const { objectsCount, usedStorage } =
      await this.objectVersionsRepo.getAllObjectVersionsCountAndSizeSum();

    const usersCount = await this.authnodeApiService.getUsersCount();

    return new GetStatsForLandingResponseDto({
      storedObjectsCount: +objectsCount,
      totalUsersCount: usersCount,
      usedStorage: usedStorage,
      usedStorageReadable: prettyBytes(+usedStorage),
    });
  }
}
