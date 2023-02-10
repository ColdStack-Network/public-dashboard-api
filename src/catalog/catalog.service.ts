import { Injectable } from '@nestjs/common';
import { DATA_VOLUME_LIST } from '../admin/users/constants';

@Injectable()
export class CatalogService {
  async getDataVolumes(): Promise<string[]> {
    return DATA_VOLUME_LIST;
  }
}
