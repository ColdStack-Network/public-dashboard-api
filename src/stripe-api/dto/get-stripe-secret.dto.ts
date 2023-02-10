import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetStripeQuery {
  @ApiPropertyOptional()
  cardValidation?: string;

  @ApiPropertyOptional()
  tariffId?: number;
}
