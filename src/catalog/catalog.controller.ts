import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';

@ApiTags('catalogs')
@Controller('catalogs')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get('/data-volumes')
  @ApiOkResponse({
    type: [String],
    description: 'Array of available data volume values',
  })
  getAvailableDataVolumes(): Promise<string[]> {
    return this.catalogService.getDataVolumes();
  }
}
