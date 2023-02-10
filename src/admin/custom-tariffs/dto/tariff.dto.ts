import { ApiProperty } from '@nestjs/swagger';
import prettyBytes from 'pretty-bytes';
import { TariffsEntity } from '../../../tariff-api/entities/tariffs.entity';

export class TariffDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  storageSize: number;

  @ApiProperty()
  bandwidth: number;

  @ApiProperty()
  costStorageGb: number;

  @ApiProperty()
  costBandwidthGb: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  storageSizePretty: string;

  @ApiProperty()
  bandwidthPretty: string;

  constructor(ent: TariffDto) {
    const { storageSize, bandwidth } = ent;
    Object.assign(this, {
      ...ent,
      storageSizePretty: prettyBytes(Number(storageSize), {
        binary: true,
      }).replace('i', ''),
      bandwidthPretty: prettyBytes(Number(bandwidth), { binary: true }).replace(
        'i',
        '',
      ),
    });
  }
}
