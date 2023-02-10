import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthnodeApiModule } from '../../authnode-api/authnode-api.module';
import { BandwidthUsageRepository } from '../../statistics/repositories/bandwidth-usage.repository';
import { BucketRepository } from '../../statistics/repositories/bucket.repository';
import { ObjectVersionsRepository } from '../../statistics/repositories/object-versions.repository';
import { ObjectRepository } from '../../statistics/repositories/object.repository';
import { StorageUsageRepository } from '../../statistics/repositories/storage-usage.repository';
import { StorageAnalyticsResponseFormatter } from '../../statistics/response-formatters/StorageAnalytics';
import { UserPlanRepository } from '../../tariff-api/repositories/userPlan.repository';
import { UserRepository } from '../users/repositories/user.repository';
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
    TypeOrmModule.forFeature([UserPlanRepository], 'default'),
    TypeOrmModule.forFeature([UserRepository], 'authnode_db'),
  ],
  providers: [StatisticsService, StorageAnalyticsResponseFormatter],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
