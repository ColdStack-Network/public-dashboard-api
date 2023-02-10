import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { StatusEnum, TicketsEntity } from '../../entities/tickets.entity';

export class TicketPaginationsWithStatus {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  perPage?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  @IsPositive()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @ApiPropertyOptional({ enum: StatusEnum })
  @IsEnum(StatusEnum)
  status?: StatusEnum;
}

export class ResponseWithPaginations {
  @ApiProperty({ type: TicketsEntity, isArray: true })
  data: TicketsEntity[];
  @ApiProperty()
  pageCount: number;
}
