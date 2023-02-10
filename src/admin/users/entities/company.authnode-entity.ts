import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MetaProperty } from '../../../common/decorators/meta-propery.decorator';

@Entity({ name: 'companies' })
export class CompanyEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @ApiProperty({ type: String })
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @ApiProperty({ type: String })
  @Column({ type: 'varchar', nullable: false })
  country: string;

  @MetaProperty({ required: false })
  @Column({ type: 'varchar', nullable: false })
  phone: string;

  @ApiProperty({ type: String })
  @Column({ type: 'varchar', name: 'data_volume', nullable: false })
  dataVolume: string;

  @ApiProperty({ type: String })
  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
