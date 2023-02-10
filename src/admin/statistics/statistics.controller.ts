import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../authnode-api/types/user-role.enum';
import { StatisticsResponseDto } from '../../statistics/dto/statistics-response.dto';
import { BandwidthAnalyticsResponseDto } from '../../statistics/dto/bandwidth-analytics-response.dto';
import { GetBandwidthAnalyticsRequestQueryDto } from '../../statistics/dto/get-bandwidth-analytics-request-query.dto';
import { StorageAnalyticsResponseDto } from '../../statistics/dto/storage-analytics-response.dto';
import { GetStorageAnalyticsRequestQueryDto } from '../../statistics/dto/get-storage-analytics-request-query.dto';
import { GetStatsForLandingResponseDto } from '../../statistics/dto/get-stats-for-landing-response.dto';
import { CommonStatisticsResponseDto } from './dto/common-statistics-response.dto';

@Controller()
@Roles(UserRole.ADMIN)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('admin/statistics/common')
  @ApiOkResponse({ type: () => CommonStatisticsResponseDto })
  async getCommonStatistics(): Promise<CommonStatisticsResponseDto> {
    return this.statisticsService.getCommonStatistics();
  }

  @Get('admin/statistics/:userId')
  @ApiOkResponse({ type: () => StatisticsResponseDto })
  async getStatistics(
    @Param('userId') userId: string,
  ): Promise<StatisticsResponseDto> {
    return this.statisticsService.getStatistics(userId);
  }

  @Get('admin/bandwidth-analytics/:userId')
  @ApiOkResponse({ type: () => BandwidthAnalyticsResponseDto })
  async getBandwidthAnalytics(
    @Query() query: GetBandwidthAnalyticsRequestQueryDto,
    @Param('userId') userId: string,
  ): Promise<BandwidthAnalyticsResponseDto> {
    return this.statisticsService.getBandwidthAnalytics(query, userId);
  }

  @Get('admin/storage-analytics/:userId')
  @ApiOkResponse({ type: () => StorageAnalyticsResponseDto })
  async getStorageAnalytics(
    @Query() query: GetStorageAnalyticsRequestQueryDto,
    @Param('userId') userId: string,
  ): Promise<StorageAnalyticsResponseDto> {
    return this.statisticsService.getStorageAnalytics(query, userId);
  }

  @Get('admin/stats-for-landing-page')
  @ApiOkResponse({ type: () => GetStatsForLandingResponseDto })
  async getStatsForLandingPage(): Promise<GetStatsForLandingResponseDto> {
    return this.statisticsService.getStatsForLandingPage();
  }
}
