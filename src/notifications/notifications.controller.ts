/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IUser } from '../authnode-api/interfaces/user.interface';
import { GetNotificationsRequestQueryDto } from './dto/get-notifications-request-query.dto';
import { GetNotificationsResponseDto } from './dto/get-notifications-response.dto';
import { SendNotificationRequestBodyDto } from './dto/send-notification-request-body';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { IsAuth } from '../authnode-api/guards/checkAuth';
import { SendNotificationToAllUsersRequestBodyDto } from './dto/send-notification-to-all-users-request-body.dto';
import { Request } from 'express';
import { APP_CONFIGS_KEY, TAppConfigs } from '../common/config';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../authnode-api/types/user-role.enum';

@Controller()
@Roles(UserRole.CUSTOMER)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    @Inject(APP_CONFIGS_KEY)
    private readonly appConfigs: TAppConfigs,
  ) {}

  @Get('/notifications')
  @ApiOkResponse({ type: () => GetNotificationsResponseDto })
  async getNotifications(
    @Query() query: GetNotificationsRequestQueryDto,
    @CurrentUser() user: IUser,
  ): Promise<GetNotificationsResponseDto> {
    return await this.notificationsService.getNotifications(user, query);
  }

  @Post('/notifications/:notificationId/read')
  @ApiOkResponse({ type: () => NotificationEntity })
  async readNotification(
    @CurrentUser() user: IUser,
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ): Promise<NotificationEntity> {
    return await this.notificationsService.readNotification(
      user,
      notificationId,
    );
  }

  @Post('/notifications/read-all')
  async readAllNotifications(@CurrentUser() user: IUser): Promise<void> {
    await this.notificationsService.readAllNotifications(user);
  }

  @Post(['/notifications/', '__internal/notifications/'])
  @ApiOkResponse({ type: () => NotificationEntity })
  async sendNotification(
    @Req() request: Request,
    @Body() body: SendNotificationRequestBodyDto,
  ): Promise<NotificationEntity> {
    if (!this.appConfigs.createNotificationIps.includes(request.ip)) {
      throw new UnauthorizedException(`Request from ${request.ip} denied.`);
    }

    return await this.notificationsService.sendNotification(body);
  }

  @Post([
    '/notifications/for-all-users',
    '__internal/notifications/for-all-users',
  ])
  async sendNotificationToAllUsers(
    @Req() request: Request,
    @Body() body: SendNotificationToAllUsersRequestBodyDto,
  ): Promise<void> {
    if (!this.appConfigs.createNotificationIps.includes(request.ip)) {
      throw new UnauthorizedException(`Request from ${request.ip} denied.`);
    }

    await this.notificationsService.sendNotificationToAllUsers(body);
  }

  @Post('/notifications/read-page')
  @ApiBody({
    schema: {
      properties: {
        ids: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
      },
    },
  })
  async readPageNotifications(@Body() body: { ids: number[] }): Promise<void> {
    await this.notificationsService.readPageNotifications(body.ids);
  }
}
