import { ApiProperty, OmitType } from '@nestjs/swagger';
import { UserPlanEntity } from '../entities/userPlan.entity';
import { TariffDto } from './tariff.dto';

export class UserPlanDto extends OmitType(UserPlanEntity, ['tariff'] as const) {
  @ApiProperty()
  tariff: TariffDto;

  @ApiProperty()
  failedTransactionPaymentIntentId?: string;

  constructor({ tariff, ...ent }: UserPlanEntity) {
    super();
    Object.assign(this, { ...ent, tariff: new TariffDto(tariff) });
  }
}
