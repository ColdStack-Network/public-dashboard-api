import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'user_cards' })
export class UserCardEntity {
  @PrimaryColumn({ type: 'varchar' })
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ required: true })
  @IsOptional()
  userId: string;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ required: true })
  brand: string;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ required: true })
  country: string;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ required: true })
  expMonth: string;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ required: true })
  expYear: string;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ required: true })
  funding: string;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ required: true })
  last4: string;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ required: true })
  network: string;

  @Column({ type: 'boolean', nullable: false })
  @ApiProperty({ required: true })
  default?: boolean;

  @Column({ type: 'boolean', nullable: false })
  @ApiProperty({ required: true })
  deleted: boolean;
}
