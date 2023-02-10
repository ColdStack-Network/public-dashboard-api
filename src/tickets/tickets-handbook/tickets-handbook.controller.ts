import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { IsAuth } from '../../authnode-api/guards/checkAuth';
import { UserRole } from '../../authnode-api/types/user-role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { HandbookTicketsReturned } from './dto/ticket-topic.dto';
import { TicketsHandbookService } from './tickets-handbook.service';

@Controller()
@Roles(UserRole.CUSTOMER)
export class TicketsHandbookController {
  constructor(private readonly handbookService: TicketsHandbookService) {}

  @Get('handbook/tickets')
  @ApiOkResponse({ type: () => HandbookTicketsReturned, isArray: true })
  async getTicketTopics(): Promise<HandbookTicketsReturned[]> {
    return this.handbookService.getTicketsTopicSubtopic();
  }
}
