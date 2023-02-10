import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'tariffs' })
export class TariffsEntity {
  @PrimaryColumn({ type: 'integer' })
  @ApiProperty()
  @IsNotEmpty()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ required: true })
  name: string;

  @Column({ type: 'bigint', nullable: false })
  @ApiProperty({ required: true })
  storage_size: number;

  @Column({ type: 'bigint', nullable: false })
  @ApiProperty({ required: true })
  @IsOptional()
  bandwidth: number;

  @Column({ type: 'bigint', precision: 10, scale: 3, nullable: false })
  @ApiProperty({ required: true })
  @IsOptional()
  cost_storage_gb: number;

  @Column({ type: 'bigint', precision: 10, scale: 3, nullable: false })
  @ApiProperty({ required: true })
  @IsOptional()
  cost_bandwidth_gb: number;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ required: true })
  description: string;

  @ApiProperty({ required: true })
  @Column({ type: 'bigint', precision: 10, scale: 3, nullable: false })
  price: number;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ required: true })
  product_id: string;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ required: true })
  price_id: string;

  @Column({ type: 'boolean', nullable: false })
  @ApiProperty({ required: true })
  test: boolean;
}
