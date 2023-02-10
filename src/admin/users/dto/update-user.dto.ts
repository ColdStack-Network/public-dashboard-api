import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { UserRole } from '../../../authnode-api/types/user-role.enum';
import { MetaProperty } from '../../../common/decorators/meta-propery.decorator';
import { IsRequiredString } from '../../../common/decorators/required-string.decorator';
import { TariffIdExists } from '../../../common/decorators/tariff-id-exists.decorator';
import { UpdateCompanyDto } from './CompanyDto';
import { UserDto } from './user.dto';

class _UserDto extends OmitType(UserDto, ['company', 'companyId']) {}

export class UpdateUserDto extends PartialType(PickType(_UserDto, ['name'])) {
  @MetaProperty()
  @IsRequiredString()
  id: string;

  @MetaProperty({ required: false })
  @IsNumber()
  @Validate(TariffIdExists)
  tariffId?: number;

  @MetaProperty({ required: false })
  @IsString()
  password?: string;

  @MetaProperty({ required: false })
  @IsEmail()
  email?: string;

  @MetaProperty({ required: false })
  @IsEnum(UserRole)
  role?: UserRole;

  @MetaProperty({ required: false })
  companyId?: string;

  @MetaProperty({ required: false })
  company?: UpdateCompanyDto;
}
