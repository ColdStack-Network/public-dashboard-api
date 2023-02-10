import { Module } from '@nestjs/common';
import { CommonService } from '../common/common.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { StatisticsModule } from './statistics/statistics.module';
import { UsersModule } from './users/users.module';
import { CustomTariffsModule } from './custom-tariffs/custom-tariffs.module';

@Module({
  imports: [UsersModule, StatisticsModule, CustomTariffsModule],
  providers: [AdminService, CommonService],
  controllers: [AdminController],
})
export class AdminModule {}
