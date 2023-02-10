import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsByteLength,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE } from '../constants';

export class CreatePhysicalUserDto {
  @IsByteLength(0, 256)
  @IsString()
  @ApiProperty({ maxLength: 256 })
  name: string;

  @IsByteLength(0, 256)
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsByteLength(0, 256)
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ maxLength: 256 })
  companyName?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  tariffId?: number;

  @IsByteLength(0, 256)
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ maxLength: 256 })
  website?: string;

  @IsByteLength(0, 256)
  @IsString()
  @ApiProperty()
  @Matches(PASSWORD_REGEX, {
    message: PASSWORD_REGEX_MESSAGE,
  })
  password: string;
}
