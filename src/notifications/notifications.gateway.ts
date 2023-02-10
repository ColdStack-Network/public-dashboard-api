/* eslint-disable @typescript-eslint/ban-ts-comment */
import { WebSocketGateway } from '@nestjs/websockets';
import _ from 'lodash';
import { Socket } from 'socket.io';
import { AuthnodeApiService } from '../authnode-api/authnode-api.service';
import { NotificationEntity } from '../entities/notification.entity';

@WebSocketGateway({
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway {
  private connectedSockets: Record<string, Socket[]> = {};

  constructor(private readonly authnodeApiService: AuthnodeApiService) {}

  async handleConnection(socket: Socket): Promise<void> {
    try {
      await this.authSocket(socket);
    } catch (err) {
      console.error('Socket auth error', err);
      socket.disconnect();
      return;
    }
    // @ts-ignore
    const user = socket.request.user;

    console.log(
      `Connection with websockets from: ${socket.handshake.address}, user: ${user.id}`,
    );

    console.log(user);

    if (this.connectedSockets[user.id]) {
      console.log(`Adding socket to existing array for ${user.id}`);
      this.connectedSockets[user.id].push(socket);
    } else {
      console.log(`Creating new socket array for ${user.id}`);
      this.connectedSockets[user.id] = [socket];
    }
  }

  handleDisconnect(socket: Socket): void {
    // @ts-ignore
    const user = socket.request.user;

    if (user) {
      console.log(`Socket disconnected: user: ${user.id}`);
      if (this.connectedSockets[user.id]) {
        _.pull(this.connectedSockets[user.id], socket);
      }
    }
  }

  public sendNotification(notification: NotificationEntity): void {
    const sockets = this.connectedSockets[notification.userId];

    console.log(
      `Sending notification for user ${
        notification.userId
      }, found connected sockets: ${sockets?.length || 0}`,
    );
    if (!sockets) {
      return;
    }

    sockets.forEach((socket) => {
      socket.emit('new_notification', notification);
    });
  }

  public sendReadStatus(
    userId: string,
    input: { notificationId?: number; all: boolean },
  ): void {
    const sockets = this.connectedSockets[userId];

    if (!sockets) {
      return;
    }

    sockets.forEach((socket) => {
      socket.emit('notifications_are_read', input);
    });
  }

  private async authSocket(socket: Socket): Promise<void> {
    const user = await this.authnodeApiService
      .getAuthData(socket.handshake.query.token as string)
      .then((user) => user);

    // @ts-ignore
    socket.request.user = user;
  }
}
