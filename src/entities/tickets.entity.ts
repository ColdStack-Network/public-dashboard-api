import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryColumn,
} from 'typeorm';

export enum StatusEnum {
  OPEN = 'open',
  CLOSE = 'close',
}

@Entity({ name: 'support_tickets' })
export class TicketsEntity {
  @ApiProperty({
    type: String,
    format: 'uuid',
  })
  @PrimaryColumn()
  @Generated('uuid')
  id: string;

  @ApiProperty()
  @PrimaryColumn()
  @Column({ type: 'varchar' })
  userId: string;

  @ApiProperty({ type: String })
  @Column({ type: 'enum', enum: StatusEnum, default: StatusEnum.OPEN })
  status: StatusEnum;

  @ApiProperty({ type: String })
  @Column({ type: 'varchar' })
  topic: string;

  @ApiProperty({
    type: String,
    format: 'email',
  })
  @Column({ type: 'varchar' })
  email: string;

  @ApiProperty({ type: String })
  @Column({ type: 'varchar' })
  subTopic: string;

  @ApiProperty({ type: String })
  @Column({ type: 'varchar' })
  subject: string;

  @ApiProperty({ type: String })
  @Column({ type: 'varchar' })
  ticketDetails: string;

  @ApiPropertyOptional({ type: [String] })
  @Column({ type: 'varchar', array: true, nullable: true })
  file: string[];

  @ApiProperty({ type: Boolean })
  @Column({ type: 'boolean', default: false })
  unreadMessage: boolean;

  @ApiProperty({ type: String })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ type: String })
  @CreateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
