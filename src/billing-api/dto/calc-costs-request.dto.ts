import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CalcCostsRequestDto {
  @ApiProperty()
  @IsNumber()
  totalDataStored: number;

  @ApiProperty()
  @IsNumber()
  monthlyDownloadedData: number;
}
