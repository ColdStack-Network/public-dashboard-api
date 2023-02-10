import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsRepository } from '../repositories/tickets.repository';
import { EmailSupportConsumer } from '../utils/queue/processorSupport';
import { TicketsHandbookModule } from './tickets-handbook/tickets-handbook.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { DefaultTopic } from './topics/default';
import { TicketsHelpersService } from './tickets-helpers.service';
import { AuthnodeApiModule } from '../authnode-api/authnode-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketsRepository]),
    TicketsHandbookModule,
    AuthnodeApiModule,
    BullModule.registerQueue({
      name: 'support',
    }),
  ],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    EmailSupportConsumer,
    DefaultTopic,
    TicketsHelpersService,
  ],
})
export class TicketsModule {}
