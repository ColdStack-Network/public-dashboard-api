import { Injectable, NotFoundException } from '@nestjs/common';
import { IUser } from '../authnode-api/interfaces/user.interface';
import { IsNull, Not, MoreThan } from 'typeorm';
import { GetNotificationsRequestQueryDto } from './dto/get-notifications-request-query.dto';
import { GetNotificationsResponseDto } from './dto/get-notifications-response.dto';
import { SendNotificationRequestBodyDto } from './dto/send-notification-request-body';
import { SendNotificationToAllUsersRequestBodyDto } from './dto/send-notification-to-all-users-request-body.dto';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsRepository } from './repositories/notifications.repository';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AuthnodeApiService } from '../authnode-api/authnode-api.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('email')
    private readonly emailQueue: Queue,
    private readonly notificationsRepo: NotificationsRepository,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly authnodeApiService: AuthnodeApiService,
  ) {}

  async getNotifications(
    user: IUser,
    query: GetNotificationsRequestQueryDto,
  ): Promise<GetNotificationsResponseDto> {
    const stats = await this.notificationsRepo.getOverallStatistics(user.id);

    if (query.id) {
      const perPage = +query.perPage || 10;

      const countBefore = await this.notificationsRepo.count({
        where: {
          userId: user.id,
          id: MoreThan(query.id),
        },
      });

      const skip = countBefore - (countBefore % perPage);

      const notifications = await this.notificationsRepo.find({
        where: {
          userId: user.id,
        },
        skip,
        take: perPage,
        order: {
          createdAt: 'DESC',
        },
      });

      return new GetNotificationsResponseDto({
        items: notifications,
        readCount: stats.readCount,
        unreadCount: stats.unreadCount,
        totalCount: stats.totalCount,
        page: query.page || Math.ceil(skip / perPage) + 1,
        perPage: perPage,
        pagesCount: Math.ceil(stats.totalCount / perPage),
      });
    }

    const page = +query.page || 1;
    const perPage = +query.perPage || 10;

    const groupCount =
      query.group === 'read'
        ? stats.readCount
        : query.group === 'unread'
        ? stats.unreadCount
        : stats.totalCount;
    const notifications = await this.notificationsRepo.find({
      where: {
        userId: user.id,
        ...(query.group === 'read'
          ? { readAt: Not(IsNull()) }
          : query.group === 'unread'
          ? { readAt: IsNull() }
          : {}),
      },
      take: perPage,
      skip: (page - 1) * perPage,
      order: {
        createdAt: 'DESC',
      },
    });

    return new GetNotificationsResponseDto({
      items: notifications,
      readCount: stats.readCount,
      unreadCount: stats.unreadCount,
      totalCount: stats.totalCount,
      group: query.group || undefined,
      page: page,
      perPage: perPage,
      pagesCount: Math.ceil(groupCount / perPage),
    });
  }

  async readNotification(
    user: IUser,
    notificationId: number,
  ): Promise<NotificationEntity> {
    const notification = await this.notificationsRepo.findOne({
      userId: user.id,
      id: notificationId,
    });

    if (!notification) {
      throw new NotFoundException();
    }

    notification.readAt = new Date();

    await this.notificationsRepo.save(notification);

    this.notificationsGateway.sendReadStatus(user.id, {
      all: false,
      notificationId: notification.id,
    });

    return notification;
  }

  async readAllNotifications(user: IUser): Promise<void> {
    await this.notificationsRepo.update(
      {
        userId: user.id,
        readAt: IsNull(),
      },
      {
        readAt: new Date(),
      },
    );

    this.notificationsGateway.sendReadStatus(user.id, { all: true });
  }

  async sendNotification(
    body: SendNotificationRequestBodyDto,
  ): Promise<NotificationEntity> {
    const emailStatus = body.email;
    const user = body.userId
      ? await this.authnodeApiService.getUserById(body.userId)
      : null;

    if (!user) {
      console.error(`User ${body.userId} not found.`);
      throw new NotFoundException();
    }

    delete body.email;
    const notification = await this.notificationsRepo.save({
      title: body.title,
      description: body.description,
      userId: user.id,
    });

    try {
      this.notificationsGateway.sendNotification(notification);
    } catch (err) {
      console.error('Error when sending notification via WS', err);
    }

    if (emailStatus) {
      this.emailQueue
        .add(
          {
            email: user.email,
            notification,
          },
          { attempts: 5, backoff: 3000 },
        )
        .catch((err) => {
          console.error('Error trying to send notification via Email', err);
        });
    }

    return notification;
  }

  async sendNotificationToAllUsers(
    body: SendNotificationToAllUsersRequestBodyDto,
  ): Promise<void> {
    const users = await this.authnodeApiService.getAllUserIds();
    const emailStatus = body.email;
    delete body.email;
    await Promise.all(
      users.map(async (user) => {
        const notification = await this.notificationsRepo.save({
          userId: user.id,
          ...body,
        });
        this.notificationsGateway.sendNotification(notification);
        if (emailStatus)
          await this.emailQueue.add(
            {
              email: user.email,
              notification,
            },
            { attempts: 5, backoff: 3000 },
          );
      }),
    );
    return;
  }

  async readPageNotifications(ids: number[]): Promise<void> {
    const notifications = await this.notificationsRepo.findByIds(ids);
    notifications.forEach(async (x) => {
      if (!x.readAt) x.readAt = new Date();
      await this.notificationsRepo.save(notifications);
      await this.notificationsGateway.sendReadStatus(x.userId, {
        notificationId: x.id,
        all: false,
      });
    });
  }
}
