import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { getConnection } from 'typeorm';
import { TariffsEntity } from '../../tariff-api/entities/tariffs.entity';

@ValidatorConstraint({ name: 'TariffIdExists', async: true })
@Injectable()
export class TariffIdExists implements ValidatorConstraintInterface {
  async validate(id: number) {
    try {
      await getConnection('default')
        .manager.getRepository(TariffsEntity)
        .findOneOrFail(id);
    } catch (e) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return `Tariff doesn't exist`;
  }
}
