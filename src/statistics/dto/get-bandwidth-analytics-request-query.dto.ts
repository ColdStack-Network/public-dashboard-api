import { IsISO8601, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetBandwidthAnalyticsRequestQueryDto {
  @ApiPropertyOptional({ format: 'ISO8601' })
  @IsISO8601()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({ format: 'ISO8601' })
  @IsISO8601()
  @IsOptional()
  toDate?: string;
}
