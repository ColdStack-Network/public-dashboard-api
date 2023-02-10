import { ApiProperty } from '@nestjs/swagger';
import prettyBytes from 'pretty-bytes';
import { TariffsEntity } from '../entities/tariffs.entity';

export class TariffDto extends TariffsEntity {
  @ApiProperty()
  storageSizePretty: string;

  @ApiProperty()
  bandwidthPretty: string;

  constructor(ent: TariffsEntity) {
    super();
    const { storage_size, bandwidth } = ent;
    Object.assign(this, {
      ...ent,
      storageSizePretty: prettyBytes(Number(storage_size), {
        binary: true,
      }).replace('i', ''),
      bandwidthPretty: prettyBytes(Number(bandwidth), { binary: true }).replace(
        'i',
        '',
      ),
    });
  }
}
