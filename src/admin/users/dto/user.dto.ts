import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '../../../authnode-api/types/user-role.enum';
import { UserStatus } from '../../../authnode-api/types/user-status.enum';
import { MetaProperty } from '../../../common/decorators/meta-propery.decorator';
import { TariffsEntity } from '../../../tariff-api/entities/tariffs.entity';
import { CompanyDto } from './CompanyDto';

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  @ApiPropertyOptional()
  tariffId?: number;

  @ApiProperty()
  tariff: TariffsEntity;

  @ApiProperty()
  status: UserStatus;

  @ApiProperty()
  filesCount: number;

  @ApiProperty()
  filesSize: { quantity: number; unit: string };

  @ApiProperty()
  openTicketsCount: number;

  @MetaProperty({ required: false })
  @IsEnum(UserRole)
  role?: UserRole;

  @MetaProperty()
  companyId?: string;

  @MetaProperty()
  company?: CompanyDto;
}
