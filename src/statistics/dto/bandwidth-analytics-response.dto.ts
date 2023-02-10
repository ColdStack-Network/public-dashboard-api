import { ApiProperty } from '@nestjs/swagger';

export class BandwidthAnalyticsResponseDto {
  @ApiProperty({
    properties: {
      Records: {
        type: 'array',
        items: {
          properties: {
            Date: { type: 'string' },
            DownloadBandwidth: { type: 'string' },
            DownloadBandwidthReadable: { type: 'string' },
            UploadBandwidth: { type: 'string' },
            UploadBandwidthReadable: { type: 'string' },
            TotalBandwidth: { type: 'string' },
            TotalBandwidthReadable: { type: 'string' },
          },
        },
      },
    },
  })
  BandwidthAnalytics: {
    Records: {
      Date: string;
      DownloadBandwidth: string;
      DownloadBandwidthReadable: string;
      UploadBandwidth: string;
      UploadBandwidthReadable: string;
      TotalBandwidth: string;
      TotalBandwidthReadable: string;
    }[];
  };
}
