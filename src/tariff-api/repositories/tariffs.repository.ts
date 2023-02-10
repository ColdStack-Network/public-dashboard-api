import { EntityRepository, Repository } from 'typeorm';
import { TariffsEntity } from '../entities/tariffs.entity';

@EntityRepository(TariffsEntity)
export class TariffRepository extends Repository<TariffsEntity> {
  async getTariffs() {
    return this.find({
      where: {
        test: process.env.NODE_ENV !== 'production',
      },
    });
  }

  async getByIdOrFail(tariffId: number): Promise<TariffsEntity> {
    return this.findOneOrFail({ id: tariffId });
  }
}
