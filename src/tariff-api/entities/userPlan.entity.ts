import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TariffsEntity } from './tariffs.entity';

@Entity({ name: 'user_plan' })
export class UserPlanEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'varchar' })
  @ApiProperty()
  user_id: string;

  @Column({ type: 'integer' })
  @ApiProperty()
  tariff_id: number;

  @Column({ type: 'timestamptz' })
  @ApiProperty()
  created_at: Date;

  @Column({ type: 'timestamptz' })
  @ApiProperty()
  end_at: Date;

  @Column()
  @ApiProperty()
  active: boolean;

  @OneToOne(() => TariffsEntity)
  @ApiProperty()
  @JoinColumn({ name: 'tariff_id', referencedColumnName: 'id' })
  tariff: TariffsEntity;
}
