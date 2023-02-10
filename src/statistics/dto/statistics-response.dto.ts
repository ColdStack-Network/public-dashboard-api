import { ApiProperty } from '@nestjs/swagger';

const countAndArrow = {
  properties: {
    Count: { type: 'number' },
  },
};

export class StatisticsResponseDto {
  @ApiProperty({
    properties: {
      Buckets: countAndArrow,
      Objects: countAndArrow,
      UsedStorage: {
        properties: {
          UsedStorageBytes: { type: 'string' },
          UsedStorageReadableQuantity: { type: 'string' },
          UsedStorageReadableUnit: { type: 'string' },
        },
      },
      Bandwidth: {
        properties: {
          BandwidthBytes: { type: 'string' },
          BandwidthReadableQuantity: { type: 'string' },
          BandwidthReadableUnit: { type: 'string' },
        },
      },
    },
  })
  Statistics: {
    Buckets: {
      Count: number;
    };
    Objects: {
      Count: number;
    };
    UsedStorage: {
      UsedStorageBytes: string;
      UsedStorageReadableQuantity: string;
      UsedStorageReadableUnit: string;
    };
    Bandwidth: {
      BandwidthBytes: string;
      BandwidthReadableQuantity: string;
      BandwidthReadableUnit: string;
    };
  };
}
