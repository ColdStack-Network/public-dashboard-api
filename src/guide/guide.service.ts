import { Injectable } from '@nestjs/common';

@Injectable()
export class GuideService {
  getStorageClass() {
    return {
      statusCode: 200,
      data: [
        { id: 1, name: 'frequentAccess' },
        { id: 2, name: 'infrequentAccess' },
        { id: 3, name: 'coldStorage' },
        { id: 4, name: 'aITiering' },
        { id: 5, name: 'deepArchive' },
      ],
    };
  }

  getRergion() {
    return {
      statusCode: 200,
      data: [
        { id: 1, name: 'region 1' },
        { id: 2, name: 'region 2' },
        { id: 3, name: 'region 3' },
        { id: 4, name: 'region 4' },
        { id: 5, name: 'region 5' },
        { id: 6, name: 'region 6' },
        { id: 7, name: 'region 7' },
        { id: 8, name: 'region 8' },
        { id: 9, name: 'region 9' },
      ],
    };
  }

  getStorageType() {
    return {
      statusCode: 200,
      data: [
        { id: 1, name: 'wasabi' },
        { id: 2, name: 'sia' },
        { id: 3, name: 'filecoin' },
      ],
    };
  }
}
