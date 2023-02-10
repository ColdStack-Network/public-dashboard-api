import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TariffDto } from './tariff.dto';

export class GetTariffsResponseDto {
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional()
  pagesCount?: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty({ type: () => TariffDto, isArray: true })
  items: TariffDto[];

  constructor(data: GetTariffsResponseDto) {
    Object.assign(this, data);
  }
}
