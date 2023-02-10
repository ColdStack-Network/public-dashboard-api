import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TicketsBodyDto {
  /**
   * @todo check if not used
   */
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiProperty({ example: 'Pricing' })
  @IsString()
  @IsNotEmpty()
  subTopic: string;

  @ApiPropertyOptional({ example: 'example@mail.ru' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'Test ticket' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'Test description of  my awesome ticket' })
  @IsString()
  @IsNotEmpty()
  ticketDetails: string;

  @ApiPropertyOptional({
    type: 'file',
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  file?: string[];
}
