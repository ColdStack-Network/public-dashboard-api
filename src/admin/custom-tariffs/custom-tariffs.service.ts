import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { APP_CONFIGS_KEY, TAppConfigs } from '../../common/config';
import { TariffRepository } from '../../tariff-api/repositories/tariffs.repository';
import { GetTarrifsQueryDto } from './dto/get-tariffs-query.dto';
import { GetTariffsResponseDto } from './dto/get-tariffs-response.dto';
import { GetTariffsQueryBuilder } from './GetTariffsQueryBuilder';

@Injectable()
export class CustomTariffsService {
  constructor(
    @InjectEntityManager()
    private readonly dashboardApiDbManager: EntityManager,
    @InjectRepository(TariffRepository, 'default')
    private readonly tariffRepo: TariffRepository,
    private readonly getTariffsQueryBuilder: GetTariffsQueryBuilder,
    @Inject(APP_CONFIGS_KEY)
    private readonly appConfigs: TAppConfigs,
  ){}
  async getAll(query: GetTarrifsQueryDto): Promise<GetTariffsResponseDto> {
    const { orderBy = 'id', order = 'ASC' } = query;

    this.getTariffsQueryBuilder.init();
    this.getTariffsQueryBuilder.orderBy = orderBy;
    this.getTariffsQueryBuilder.order = order;
    this.getTariffsQueryBuilder.limit = query.perPage || 10;

    const totalCount = await this.tariffRepo.count({
      where: {
        test: this.appConfigs.isDevEnv,
      }
    });

    const items = await this.dashboardApiDbManager.query(
      this.getTariffsQueryBuilder.build(),
    );

    const page = +query.page || 1;
    const perPage = +query.perPage || 10;

    this.getTariffsQueryBuilder.offset = (page - 1) * perPage;

    return new GetTariffsResponseDto({
      items,
      totalCount,
      page,
      perPage,
      pagesCount: Math.ceil(totalCount / perPage),
    });
  }
}
