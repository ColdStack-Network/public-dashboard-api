import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ResponseWithPaginations,
  TicketPaginationsWithStatus,
} from '../tickets/interfaces/paginations.interface';
import { StatusEnum, TicketsEntity } from '../entities/tickets.entity';
import { TicketsRepository } from '../repositories/tickets.repository';
import { TicketsBodyDto } from './dto/tickets.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { DefaultTopic } from './topics/default';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { IUser } from '../authnode-api/interfaces/user.interface';
import { AuthnodeApiService } from '../authnode-api/authnode-api.service';

@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketsRep: TicketsRepository,
    @InjectQueue('support')
    private readonly emailQueue: Queue,
    private readonly defaultTopic: DefaultTopic,
    @InjectPinoLogger(AuthnodeApiService.name)
    private readonly logger: PinoLogger,
  ) {}

  async createTicket(
    body: TicketsBodyDto & { userId: string; email: string | null },
    currentUser: IUser,
  ): Promise<TicketsEntity> {
    const newTicket = await this.ticketsRep.save(body);

    if (!newTicket) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.defaultTopic.prepare(currentUser, newTicket);

      await this.defaultTopic.send();
    } catch (err) {
      console.error('createTicket: ', err);
    }

    this.emailQueue
      .add(newTicket, { attempts: 5, backoff: 3000 })
      .catch((err) => {
        console.error('Error trying to send ticket via Email', err);
      });

    return newTicket;
  }

  async getAllTickets(
    filter: TicketPaginationsWithStatus,
  ): Promise<ResponseWithPaginations> {
    if (!filter.perPage) filter.perPage = 5;
    if (!filter.page) filter.page = 1;
    const [result, total] = await this.ticketsRep.findAndCount({
      where: filter.status ? { status: filter.status } : {},
      take: filter.perPage,
      skip: (filter.page - 1) * filter.perPage,
      order: {
        updatedAt: 'DESC',
      },
    });
    return {
      data: result,
      pageCount: Math.ceil(total / filter.perPage),
    };
  }

  async getByUser(
    filter: TicketPaginationsWithStatus,
    userId: string,
  ): Promise<ResponseWithPaginations> {
    if (!filter.perPage) filter.perPage = 5;
    if (!filter.page) filter.page = 1;
    const [result, total] = await this.ticketsRep.findAndCount({
      where: filter.status ? { userId, status: filter.status } : { userId },
      take: filter.perPage,
      skip: (filter.page - 1) * filter.perPage,
      order: {
        updatedAt: 'DESC',
      },
    });
    return {
      data: result,
      pageCount: Math.ceil(total / filter.perPage),
    };
  }

  async getOneTicket(id: string): Promise<TicketsEntity> {
    const result = await this.ticketsRep.findOne(id);
    if (!result)
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    return result;
  }

  async changeTicketStatus(
    id: string,
    status: StatusEnum,
  ): Promise<TicketsEntity> {
    const ticketToUpdate = await this.ticketsRep.findOne(id);
    if (!ticketToUpdate)
      throw new HttpException(
        { message: `Ticket ${id} not found` },
        HttpStatus.NOT_FOUND,
      );
    ticketToUpdate.status = status;
    ticketToUpdate.updatedAt = new Date();
    return this.ticketsRep.save(ticketToUpdate);
  }

  async changeMessageStatus(
    id: string,
    unreadMessage: boolean,
  ): Promise<TicketsEntity> {
    const ticketToUpdate = await this.ticketsRep.findOne(id);
    if (!ticketToUpdate)
      throw new HttpException(
        { message: `Ticket ${id} not found` },
        HttpStatus.NOT_FOUND,
      );
    ticketToUpdate.unreadMessage = unreadMessage;
    ticketToUpdate.updatedAt = new Date();
    return this.ticketsRep.save(ticketToUpdate);
  }

  async deleteTicket(id: string): Promise<void> {
    await this.ticketsRep.delete(id);
  }
}
