import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '../authnode-api/types/user-role.enum';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {}
