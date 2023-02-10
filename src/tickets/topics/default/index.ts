import { Inject, Injectable } from '@nestjs/common';
import { APP_CONFIGS_KEY, TAppConfigs } from '../../../common/config';
import axios from 'axios';
import { template } from './message-template';
import { TicketsEntity } from '../../../entities/tickets.entity';
import { TicketsHelpersService } from '../../tickets-helpers.service';
import { IUser } from '../../../authnode-api/interfaces/user.interface';

@Injectable()
export class DefaultTopic {
  private message: string;

  constructor(
    @Inject(APP_CONFIGS_KEY)
    private readonly appConfigs: TAppConfigs,
    private readonly ticketsHelpersService: TicketsHelpersService,
  ) {}

  async prepare(currentUser: IUser, ticket: TicketsEntity): Promise<void> {
    this.message = this.ticketsHelpersService.tokenize(template, {
      userId: currentUser.id,
      ticketId: ticket.id,
      ticketDetails: ticket.ticketDetails,
      email: ticket.email,
      subject: ticket.subject,
      topic: ticket.topic,
      subTopic: ticket.subTopic,
      createdAt: ticket.createdAt,
    });
  }

  async send(): Promise<void> {
    await axios.get(
      `https://api.telegram.org/bot${this.appConfigs.supportTicketsNotifications.botToken}/sendMessage`,
      {
        params: {
          chat_id: this.appConfigs.supportTicketsNotifications.chatId,
          text: this.message,
        },
      },
    );
  }
}
