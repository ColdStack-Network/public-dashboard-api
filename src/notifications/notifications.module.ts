import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsRepository } from './repositories/notifications.repository';
import { NotificationsGateway } from './notifications.gateway';
import { EmailConsumer } from '../utils/queue/processorEmail';
import { BullModule } from '@nestjs/bull';
import { AuthnodeApiModule } from '../authnode-api/authnode-api.module';

@Module({
  imports: [
    AuthnodeApiModule,
    TypeOrmModule.forFeature([NotificationsRepository]),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [NotificationsService, NotificationsGateway, EmailConsumer],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
