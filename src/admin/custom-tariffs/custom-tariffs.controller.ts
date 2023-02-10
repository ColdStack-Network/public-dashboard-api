import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CustomTariffsService } from './custom-tariffs.service';
import { GetTariffsResponseDto } from './dto/get-tariffs-response.dto';
import { GetTarrifsQueryDto } from './dto/get-tariffs-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../authnode-api/types/user-role.enum';

@ApiTags('admin/custom-tariffs')
@Controller('admin/custom-tariffs')
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class CustomTariffsController {
  constructor(private customTariffsService: CustomTariffsService) {}

  @Get('')
  @HttpCode(200)
  @ApiOkResponse({
    type: GetTariffsResponseDto,
  })
  async getAll(
    @Query() query: GetTarrifsQueryDto,
  ): Promise<GetTariffsResponseDto> {
    return this.customTariffsService.getAll(query);
  }
}
