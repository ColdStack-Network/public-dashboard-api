import { ApiProperty } from '@nestjs/swagger';

export class GetStatsForLandingResponseDto {
  @ApiProperty()
  usedStorage: string;

  @ApiProperty()
  usedStorageReadable: string;

  @ApiProperty()
  totalUsersCount: number;

  @ApiProperty()
  storedObjectsCount: number;

  constructor(data: GetStatsForLandingResponseDto) {
    Object.assign(this, data);
  }
}
