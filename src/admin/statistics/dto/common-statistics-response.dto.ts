import { ApiProperty } from '@nestjs/swagger';

export class CommonStatisticsResponseDto {
  @ApiProperty()
  totalUsersCount: number;

  @ApiProperty()
  storedObjectsCount: number;

  @ApiProperty()
  usedStorage: string;

  @ApiProperty()
  usedStorageReadable: string;

  @ApiProperty()
  activeTariffs: number;

  @ApiProperty()
  unpaidTariffs: number;

  @ApiProperty()
  suspendedTariffs: number;
}
