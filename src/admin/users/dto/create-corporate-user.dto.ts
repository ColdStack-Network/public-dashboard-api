import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsByteLength,
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';
import { PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE } from '../constants';

export class CreateCorporateUserDto {
  @IsByteLength(0, 256)
  @IsString()
  @ApiProperty({ maxLength: 256 })
  firstName: string;

  @IsByteLength(0, 256)
  @IsString()
  @ApiProperty({ maxLength: 256 })
  lastName: string;

  @IsByteLength(0, 256)
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsByteLength(0, 256)
  @IsPhoneNumber()
  @IsOptional()
  @ApiPropertyOptional({ maxLength: 256 })
  phone?: string;

  @IsByteLength(0, 256)
  @IsString()
  @ApiProperty()
  country: string;

  @IsByteLength(0, 256)
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ maxLength: 256 })
  companyName?: string;

  @IsString()
  @ApiProperty({ maxLength: 256 })
  dataVolume: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  tariffId?: number;

  @IsByteLength(0, 256)
  @IsString()
  @ApiProperty()
  @Matches(PASSWORD_REGEX, {
    message: PASSWORD_REGEX_MESSAGE,
  })
  password: string;
}
