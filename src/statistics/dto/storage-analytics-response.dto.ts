import { ApiProperty } from '@nestjs/swagger';

export class StorageAnalyticsResponseDto {
  @ApiProperty({
    properties: {
      Records: {
        type: 'array',
        items: {
          properties: {
            Timestamp: { type: 'string' },
            UsedStorage: { type: 'string' },
            UsedStorageReadable: { type: 'string' },
          },
        },
      },
    },
  })
  StorageUsageAnalytics: {
    Records: {
      Timestamp: string;
      UsedStorage: string;
      UsedStorageReadable: string;
    }[];
  };
}
