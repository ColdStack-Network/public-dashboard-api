import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthnodeApiModule } from '../authnode-api/authnode-api.module';
import { BandwidthUsageRepository } from './repositories/bandwidth-usage.repository';
import { BucketRepository } from './repositories/bucket.repository';
import { ObjectVersionsRepository } from './repositories/object-versions.repository';
import { ObjectRepository } from './repositories/object.repository';
import { StorageUsageRepository } from './repositories/storage-usage.repository';
import { StorageAnalyticsResponseFormatter } from './response-formatters/StorageAnalytics';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [
    AuthnodeApiModule,
    forwardRef(() => AuthnodeApiModule),
    TypeOrmModule.forFeature(
      [
        BucketRepository,
        ObjectRepository,
        ObjectVersionsRepository,
        BandwidthUsageRepository,
        StorageUsageRepository,
      ],
      'filenode_db',
    ),
  ],
  providers: [StatisticsService, StorageAnalyticsResponseFormatter],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
