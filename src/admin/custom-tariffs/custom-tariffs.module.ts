import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TariffRepository } from '../../tariff-api/repositories/tariffs.repository';
import { CustomTariffsController } from './custom-tariffs.controller';
import { CustomTariffsService } from './custom-tariffs.service';
import { GetTariffsQueryBuilder } from './GetTariffsQueryBuilder';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [TariffRepository],
      'default',
    ),
  ],
  controllers: [CustomTariffsController],
  providers: [CustomTariffsService, GetTariffsQueryBuilder],
})
export class CustomTariffsModule {}
