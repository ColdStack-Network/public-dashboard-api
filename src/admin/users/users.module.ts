import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthnodeApiModule } from '../../authnode-api/authnode-api.module';
import { CommonService } from '../../common/common.service';
import { TicketsRepository } from '../../repositories/tickets.repository';
import { BucketRepository } from '../../statistics/repositories/bucket.repository';
import { ObjectVersionsRepository } from '../../statistics/repositories/object-versions.repository';
import { ObjectRepository } from '../../statistics/repositories/object.repository';
import { TariffRepository } from '../../tariff-api/repositories/tariffs.repository';
import { UserPlanRepository } from '../../tariff-api/repositories/userPlan.repository';
import { GetUsersQueryBuilder } from './GetUsersQueryBuilder';
import { CompanyRepository } from './repositories/company.repository';
import { UserRepository } from './repositories/user.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    AuthnodeApiModule,
    TypeOrmModule.forFeature(
      [TariffRepository, UserPlanRepository, TicketsRepository],
      'default',
    ),
    TypeOrmModule.forFeature(
      [UserRepository, CompanyRepository],
      'authnode_db',
    ),
    TypeOrmModule.forFeature(
      [BucketRepository, ObjectRepository, ObjectVersionsRepository],
      'filenode_db',
    ),
  ],
  controllers: [UsersController],
  providers: [UsersService, CommonService, GetUsersQueryBuilder],
})
export class UsersModule {}
