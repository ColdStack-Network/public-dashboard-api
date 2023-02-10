import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { IsAuth } from '../authnode-api/guards/checkAuth';
import { StatisticsService } from './statistics.service';
import { GetBandwidthAnalyticsRequestQueryDto } from './dto/get-bandwidth-analytics-request-query.dto';
import { GetStorageAnalyticsRequestQueryDto } from './dto/get-storage-analytics-request-query.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { StatisticsResponseDto } from './dto/statistics-response.dto';
import { StorageAnalyticsResponseDto } from './dto/storage-analytics-response.dto';
import { BandwidthAnalyticsResponseDto } from './dto/bandwidth-analytics-response.dto';
import { GetStatsForLandingResponseDto } from './dto/get-stats-for-landing-response.dto';
import { IUser } from '../authnode-api/interfaces/user.interface';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../authnode-api/types/user-role.enum';

@Controller()
@Roles(UserRole.CUSTOMER)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('statistics')
  @ApiOkResponse({ type: () => StatisticsResponseDto })
  async getStatistics(
    @Req() req: { user: IUser },
  ): Promise<StatisticsResponseDto> {
    return this.statisticsService.getStatistics(req.user);
  }

  @Get('bandwidth-analytics')
  @ApiOkResponse({ type: () => BandwidthAnalyticsResponseDto })
  async getBandwidthAnalytics(
    @Query() query: GetBandwidthAnalyticsRequestQueryDto,
    @Req() req: { user: IUser },
  ): Promise<BandwidthAnalyticsResponseDto> {
    return this.statisticsService.getBandwidthAnalytics(query, req.user);
  }

  @Get('storage-analytics')
  @ApiOkResponse({ type: () => StorageAnalyticsResponseDto })
  async getStorageAnalytics(
    @Query() query: GetStorageAnalyticsRequestQueryDto,
    @Req() req: { user: IUser },
  ): Promise<StorageAnalyticsResponseDto> {
    return this.statisticsService.getStorageAnalytics(query, req.user);
  }

  @Get('stats-for-landing-page')
  @ApiOkResponse({ type: () => GetStatsForLandingResponseDto })
  async getStatsForLandingPage(): Promise<GetStatsForLandingResponseDto> {
    return this.statisticsService.getStatsForLandingPage();
  }
}
