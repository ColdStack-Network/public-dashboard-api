import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TariffIdsTuple } from './TarfffIdEnum';
import { CompanyEntity } from './company.authnode-entity';
import { UserRole } from '../../../authnode-api/types/user-role.enum';
import { UserStatus } from '../../../authnode-api/types/user-status.enum';
import { TariffsEntity } from '../../../tariff-api/entities/tariffs.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @ApiProperty({ type: String })
  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ type: String })
  @Column({ type: 'varchar', nullable: false })
  email: string;

  @ApiProperty({ type: String })
  @Column({ type: 'varchar', nullable: true })
  newEmail: string;

  /**
   * У юзеров есть возможность менять свою почту. Новые адреса тоже нужно подтверждать.
   * {@link emailVerified} показывает подтверждена ли текущая почта, а {@link emailAtRegistrationIsVerified}
   * показывает подтвердили ли самую первую почту при регистрации. Это нужно чтобы отличать
   * пользователей, которые когда либо в прошлом уже подтверждали почту от тех, кто поменял его и не подтвердил еще.
   */
  @Column({ type: 'boolean', nullable: false, default: false })
  emailAtRegistrationIsVerified: boolean;

  @ApiProperty({ type: Boolean })
  @Column({ type: 'boolean', nullable: false, default: false })
  finishedRegistration: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', nullable: false })
  emailVerified: boolean;

  @ApiProperty()
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @ApiProperty()
  @Column({ type: 'varchar', name: 'last_name', nullable: true })
  lastName?: string;

  @Column({
    type: 'enum',
    enumName: 'user_role_enum',
    nullable: false,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', nullable: true })
  companyName?: string;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', nullable: true })
  website?: string;

  @ApiPropertyOptional({
    description:
      'ID of the selected tariff plan. 0(3) - "Pay As You Go", 1(4) - "Business", 2(5) - "Enterprise"; * (n) - ids using dev only env',
    enum: TariffIdsTuple,
  })
  @Column({ type: 'integer', nullable: true })
  tariffId?: number;

  @ApiPropertyOptional({
    description:
      'ID of the selected next tariff plan. 0(3) - "Pay As You Go", 1(4) - "Business", 2(5) - "Enterprise"; * (n) - ids using dev only env',
    enum: TariffIdsTuple,
  })
  @Column({ type: 'integer', nullable: true })
  nextTariffId?: number;

  @Column({ type: 'varchar', nullable: true })
  provider?: string;

  @Column({ type: 'varchar', nullable: true })
  providerId?: string;

  @Column({ type: 'varchar', nullable: true })
  password?: string;

  @Column({
    type: 'enum',
    enumName: 'user_status_enum',
    nullable: false,
    default: UserStatus.Active,
  })
  status: UserStatus;

  @Column({ type: 'varchar', nullable: true })
  stripeCustomerId?: string;

  @ApiPropertyOptional({ type: String })
  arn?: string;

  @ApiProperty({ type: String })
  @Column({ type: 'uuid', name: 'company_id', nullable: true })
  companyId: string;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
  company?: CompanyEntity;

  @ApiProperty()
  hasStoredPassword: boolean;

  @AfterLoad()
  afterLoad(): void {
    this.hasStoredPassword = !!this.password;
  }
}
