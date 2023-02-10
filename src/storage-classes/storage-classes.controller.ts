import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { UserRole } from '../authnode-api/types/user-role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { StorageClasses } from '../entities/storage-classes.entity';
import { StorageClassesService } from './storage-classes.service';

@Controller('storage-classes')
@Roles(UserRole.CUSTOMER)
export class StorageClassesController {
  constructor(private readonly storageClassesService: StorageClassesService) {}

  @Get()
  @ApiOkResponse({ type: () => StorageClasses, isArray: true })
  getStorage(): StorageClasses[] {
    return this.storageClassesService.get();
  }
}
