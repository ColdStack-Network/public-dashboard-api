import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { StatusEnum } from '../../entities/tickets.entity';

export class StatusValidate {
  @ApiProperty({ enum: StatusEnum })
  @IsEnum(StatusEnum)
  status: StatusEnum;
}

export class MessageValidate {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  unreadMessage: boolean;
}
