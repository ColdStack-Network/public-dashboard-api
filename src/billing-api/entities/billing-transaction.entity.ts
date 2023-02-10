import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserCardEntity } from './user-card.entity';
import { UserPlanEntity } from '../../tariff-api/entities/userPlan.entity';
import { PaymentProvider } from '../types/payment-provider.enum';
import { BillingTransactionStatus } from '../types/billing-transaction-status.enum';
import { BillingTransactionType } from '../types/billing-transaction-type.enum';

@Entity({ name: 'billing_transactions' })
export class BillingTransactionEntity {
  @PrimaryColumn({ type: 'varchar' })
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @Column({ name: 'user_id', type: 'varchar', nullable: false })
  @ApiProperty({ required: false })
  @IsOptional()
  userId: string;

  @Column({ name: 'card_id', type: 'varchar', nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  cardId: string;

  @Column({ name: 'user_plan_id', type: 'integer', nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  userPlanId: number;

  @Column({ name: 'payment_provider', type: 'varchar', nullable: false })
  @ApiProperty({ required: true })
  paymentProvider: PaymentProvider;

  @Column({ name: 'payment_payload', type: 'jsonb', nullable: false })
  @ApiProperty({ required: true })
  paymentPayload?: any;

  @Column({ type: 'jsonb', nullable: false })
  @ApiProperty({ required: false })
  @IsOptional()
  errors?: any;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ required: true, enum: BillingTransactionStatus })
  status: BillingTransactionStatus;

  @Column({ name: 'type', type: 'varchar', nullable: false })
  @ApiProperty({ required: true, enum: BillingTransactionType })
  type: BillingTransactionType;

  @ApiProperty({ required: true })
  @Column({ type: 'bigint', precision: 10, scale: 2, nullable: false })
  amount: number;

  @ApiProperty({ required: false })
  @Column({ name: 'tariff_id', type: 'integer', nullable: true })
  @IsOptional()
  tariffId?: number;

  @ApiProperty()
  @Column({ type: 'boolean', nullable: true })
  refundable: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', nullable: false })
  @ApiProperty({ required: true })
  createdAt: Date;

  @OneToOne(() => UserPlanEntity)
  @ApiProperty()
  @JoinColumn({ name: 'user_plan_id', referencedColumnName: 'id' })
  userPlan: UserPlanEntity;

  @OneToOne(() => UserCardEntity)
  @ApiProperty()
  @JoinColumn({ name: 'card_id', referencedColumnName: 'id' })
  userCard: UserCardEntity;
}
