import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'stripe_events' })
export class StripeEventEntity {
  @PrimaryColumn({ type: 'varchar' })
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @Column({ type: 'timestamptz', nullable: true })
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: false })
  @ApiProperty({ required: true })
  event: string;
}
