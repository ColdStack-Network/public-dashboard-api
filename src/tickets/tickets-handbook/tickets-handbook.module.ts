import { Module } from '@nestjs/common';
import { TicketsHandbookService } from './tickets-handbook.service';
import { TicketsHandbookController } from './tickets-handbook.controller';
import { AuthnodeApiModule } from '../../authnode-api/authnode-api.module';

@Module({
  imports: [AuthnodeApiModule],
  providers: [TicketsHandbookService],
  controllers: [TicketsHandbookController],
})
export class TicketsHandbookModule {}
