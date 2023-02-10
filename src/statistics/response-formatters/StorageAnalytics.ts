import { Injectable } from '@nestjs/common';
import prettyBytes from 'pretty-bytes';
import { StorageAnalyticsResponseDto } from '../dto/storage-analytics-response.dto';

export type StorageAnalyticsResults = Record<
  string,
  {
    timestamp: string;
    usedStorage: string;
  }
>;

@Injectable()
export class StorageAnalyticsResponseFormatter {
  format(results: StorageAnalyticsResults): StorageAnalyticsResponseDto {
    const resp = Object.keys(results).map((key) => {
      const rec = results[key];

      return {
        Timestamp: rec.timestamp,
        UsedStorage: rec.usedStorage,
        UsedStorageReadable: prettyBytes(parseInt(rec.usedStorage)),
      };
    });

    return {
      StorageUsageAnalytics: {
        Records: resp,
      },
    };
  }
}
