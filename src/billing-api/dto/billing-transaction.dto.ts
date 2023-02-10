import { ApiProperty, OmitType } from '@nestjs/swagger';
import { UserCardDto } from '../cards/dto/user-card.dto';
import { UserPlanDto } from '../../tariff-api/dto/userPlan.dto';
import { BillingTransactionEntity } from '../entities/billing-transaction.entity';
import { Entity } from 'typeorm';

@Entity({ name: 'billing_transactions' })
export class BillingTransactionDto extends OmitType(BillingTransactionEntity, [
  'userPlan',
  'userCard',
  'amount',
] as const) {
  @ApiProperty({ nullable: true })
  invoiceId?: string | null;

  @ApiProperty({ nullable: true })
  downloadPdfLink?: string;

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  successCount: number;

  @ApiProperty()
  pendingCount: number;

  @ApiProperty()
  failedCount: number;

  @ApiProperty()
  amount: number;

  @ApiProperty({ nullable: true })
  tariffId?: number;

  @ApiProperty()
  userPlan: UserPlanDto;

  @ApiProperty()
  userCard: UserCardDto;

  constructor({
    userPlan,
    userCard,
    amount,
    ...ent
  }: BillingTransactionEntity) {
    super();

    Object.assign(this, {
      ...ent,
      amount: (amount / 100).toFixed(2),
      userCard: new UserCardDto(userCard),
      userPlan: userPlan ? new UserPlanDto(userPlan) : {},
    });
  }
}
