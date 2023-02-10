import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  Req,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TicketsEntity } from '../entities/tickets.entity';
import { TicketsService } from './tickets.service';
import { TicketsBodyDto } from './dto/tickets.dto';
import { MessageValidate, StatusValidate } from './dto/ticket.update.dto';
import {
  ResponseWithPaginations,
  TicketPaginationsWithStatus,
} from '../tickets/interfaces/paginations.interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileInterceptorSettings } from '../common/config/s3.config';
import { IsAuth } from '../authnode-api/guards/checkAuth';
import { IUser } from '../authnode-api/interfaces/user.interface';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../authnode-api/types/user-role.enum';

@ApiTags('Tickets')
@Controller('tickets')
@Roles(UserRole.CUSTOMER)
export class TicketsController {
  constructor(private readonly ticketsServcie: TicketsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    type: ResponseWithPaginations,
  })
  @ApiQuery({ type: TicketPaginationsWithStatus })
  @UsePipes(new ValidationPipe())
  async getAllTickets(
    @Query()
    query: TicketPaginationsWithStatus,
  ) {
    return this.ticketsServcie.getAllTickets(query);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: TicketsBodyDto })
  @UseInterceptors(FilesInterceptor('file', null, fileInterceptorSettings))
  @ApiResponse({ status: 201, type: TicketsEntity })
  async createTicket(
    @Body() body: TicketsBodyDto,
    @Req() req: { user: IUser },
    @UploadedFiles() file,
  ) {
    return this.ticketsServcie.createTicket(
      {
        userId: req.user.id,
        file: file ? file.map((x) => x.location) : [],
        ...body,
        email: body.email || req.user.email,
      },
      req.user,
    );
  }

  @UsePipes(new ValidationPipe())
  @ApiResponse({ status: 200, type: ResponseWithPaginations })
  @ApiQuery({ type: TicketPaginationsWithStatus })
  @Get('/by-user')
  async getTicketsUser(
    @Req() req: { user: IUser },
    @Query()
    query: TicketPaginationsWithStatus,
  ) {
    return this.ticketsServcie.getByUser(query, req.user.id);
  }

  @Get('/:id')
  @ApiResponse({ status: 200, type: TicketsEntity })
  async getOneTicket(@Param('id') id: string) {
    return this.ticketsServcie.getOneTicket(id);
  }

  @UsePipes(new ValidationPipe())
  @ApiResponse({ status: 200, type: ResponseWithPaginations })
  @ApiResponse({
    status: 404,
    description: `If Ticket not found`,
  })
  @Put('/:id/read-status')
  async changeMessageStatus(
    @Param('id') id: string,
    @Body() body: MessageValidate,
  ) {
    return this.ticketsServcie.changeMessageStatus(id, body.unreadMessage);
  }

  @UsePipes(new ValidationPipe())
  @ApiResponse({ status: 200, type: TicketsEntity })
  @Put('/:id/status')
  @ApiResponse({
    status: 404,
    description: `If Ticket not found`,
  })
  async changeTicketStatus(
    @Param('id') id: string,
    @Body()
    body: StatusValidate,
  ) {
    return this.ticketsServcie.changeTicketStatus(id, body.status);
  }

  @Delete('/:id')
  @ApiResponse({ status: 204 })
  async deleteTicket(@Param('id') id: string) {
    return this.ticketsServcie.deleteTicket(id);
  }
}
