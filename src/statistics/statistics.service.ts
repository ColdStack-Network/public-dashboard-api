import { BucketRepository } from './repositories/bucket.repository';
import { ObjectRepository } from './repositories/object.repository';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import prettyBytes from 'pretty-bytes';
import { BandwidthUsageRepository } from './repositories/bandwidth-usage.repository';
import moment from 'moment';
import BN from 'bignumber.js';
import { StorageUsageRepository } from './repositories/storage-usage.repository';
import { StorageAnalyticsResponseFormatter } from './response-formatters/StorageAnalytics';
import { GetBandwidthAnalyticsRequestQueryDto } from './dto/get-bandwidth-analytics-request-query.dto';
import { GetStorageAnalyticsRequestQueryDto } from './dto/get-storage-analytics-request-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StatisticsResponseDto } from './dto/statistics-response.dto';
import { StorageAnalyticsResponseDto } from './dto/storage-analytics-response.dto';
import { BandwidthAnalyticsResponseDto } from './dto/bandwidth-analytics-response.dto';
import { AuthnodeApiService } from '../authnode-api/authnode-api.service';
import { GetStatsForLandingResponseDto } from './dto/get-stats-for-landing-response.dto';
import { IUser } from '../authnode-api/interfaces/user.interface';
import { ObjectVersionsRepository } from './repositories/object-versions.repository';

@Injectable()
export class StatisticsService {
  constructor(
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
    @Inject(forwardRef(() => AuthnodeApiService))
    private readonly authnodeApiService: AuthnodeApiService,
    private readonly storageAnalyticsResponseFormatter: StorageAnalyticsResponseFormatter,
  ) {}

  /**
   * TODO: calculate object versions sizes
   */
  async getStatistics(user: IUser): Promise<StatisticsResponseDto> {
    // Fix in Filenode to use with user IDs
    const buckets = await this.bucketRepo.getByOwnerUserId(user.id);

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
      await this.bandwidthUsageRepo.getBandwidthUsageOfUser(user.id);

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
    user: IUser,
  ): Promise<BandwidthAnalyticsResponseDto> {
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
    user: IUser,
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
        userId: user.id,
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
            user.id,
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
