import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class GetStorageAnalyticsRequestQueryDto {
  @ApiPropertyOptional({ format: 'ISO8601' })
  @IsISO8601()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({ format: 'ISO8601' })
  @IsISO8601()
  @IsOptional()
  toDate?: string;
}
