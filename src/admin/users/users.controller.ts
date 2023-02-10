import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthnodeApiService } from '../../authnode-api/authnode-api.service';
import { UserRole } from '../../authnode-api/types/user-role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { OkResponseDto } from '../../common/utils';
import { CreateCorporateUserDto } from './dto/create-corporate-user.dto';
import { CreatePhysicalUserDto } from './dto/create-physical-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { GetUsersResponseDto } from './dto/get-users-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { UsersService } from './users.service';

@ApiTags('admin/users')
@Controller('admin/users')
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(
    private readonly authnodeApiService: AuthnodeApiService,
    private readonly usersService: UsersService,
  ) {}

  @Post('create-verified-user/physical')
  @ApiOkResponse()
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer jwtToken',
  })
  async createUser(@Body() body: CreatePhysicalUserDto): Promise<void> {
    try {
      await this.authnodeApiService.createVerifiedPhysicalUser(body);
    } catch (err) {
      throw new HttpException(
        err.response.data || 'Internal server error',
        err.response.status || 500,
      );
    }
  }

  @Post('create-verified-user/corporate')
  @ApiOkResponse()
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer jwtToken',
  })
  async createCorporateUser(
    @Body() body: CreateCorporateUserDto,
  ): Promise<void> {
    try {
      await this.authnodeApiService.createVerifiedCorporateUser(body);
    } catch (err) {
      throw new HttpException(
        err.response.data || 'Internal server error',
        err.response.status || 500,
      );
    }
  }

  @Get('')
  @ApiOkResponse({
    type: GetUsersResponseDto,
  })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer jwtToken',
  })
  async getUsers(
    @Query() query: GetUsersQueryDto,
  ): Promise<GetUsersResponseDto> {
    try {
      return await this.usersService.getUsers(query);
    } catch (err) {
      return err.response.data;
    }
  }

  @Put('')
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @ApiOkResponse({
    type: OkResponseDto,
  })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer jwtToken',
  })
  async updateUser(@Body() body: UpdateUserDto): Promise<OkResponseDto> {
    try {
      await this.usersService.updateUser(body);
      return OkResponseDto.create();
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
}
