import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetTarrifsQueryDto {
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional({
    enum: ['ASC', 'DESC', ''],
    description: 'Тип сортировки. По умолчанию DESC',
  })
  order?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    enum: [
      'storageSize',
      'bandwidth',
      'costStorageGb',
      'costBandwidthGb',
      'price',
      'trialDays',
      ''
    ],
  })
  orderBy?:
    | 'storageSize'
    | 'bandwidth'
    | 'costStorageGb'
    | 'costBandwidthGb'
    | 'price'
    | 'trialDays'
    | ''
}
