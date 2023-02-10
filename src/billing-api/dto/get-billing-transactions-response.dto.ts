import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingTransactionDto } from './billing-transaction.dto';

export class GetBillingTransactionsResponseDto {
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional()
  pagesCount?: number;

  @ApiPropertyOptional({ enum: ['all', 'success', 'pending', 'failed'] })
  group?: 'all' | 'success' | 'pending' | 'failed';

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  successCount: number;

  @ApiProperty()
  pendingCount: number;

  @ApiProperty()
  failedCount: number;

  @ApiProperty({ type: () => BillingTransactionDto, isArray: true })
  items: BillingTransactionDto[];

  constructor(data: GetBillingTransactionsResponseDto) {
    Object.assign(this, data);
  }
}
