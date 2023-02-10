import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingTransactionStatus } from '../types/billing-transaction-status.enum';

export class PaymentStatusDto {
  @ApiProperty({ enum: BillingTransactionStatus })
  status: string;

  @ApiPropertyOptional({ type: String })
  reason?: string;
}
