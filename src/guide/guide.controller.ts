import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GuideService } from './guide.service';
import { SuccessUpdateQntitiesApi } from './entities/storage-class.entity';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../authnode-api/types/user-role.enum';

@ApiTags('Guide')
@Controller('guide')
@Roles(UserRole.CUSTOMER)
export class GuideController {
  constructor(private readonly guideService: GuideService) {}

  @Get('/storage-class')
  @ApiResponse({
    status: 200,
    description: 'storage-class',
    type: SuccessUpdateQntitiesApi,
  })
  getStarageClass() {
    return this.guideService.getStorageClass();
  }

  @Get('/region')
  @ApiResponse({
    status: 200,
    description: 'region',
    type: SuccessUpdateQntitiesApi,
  })
  getRergion() {
    return this.guideService.getRergion();
  }

  @Get('/storage-type')
  @ApiResponse({
    status: 200,
    description: 'storage-type',
    type: SuccessUpdateQntitiesApi,
  })
  getStorrageType() {
    return this.guideService.getStorageType();
  }
}
