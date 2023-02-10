import { Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { IsAuth } from '../../authnode-api/guards/checkAuth';
import { IUser } from '../../authnode-api/interfaces/user.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserCardDto } from './dto/user-card.dto';
import { UserCardEntity } from '../entities/user-card.entity';
import { CardsService } from './cards.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../authnode-api/types/user-role.enum';

@Controller('/billing-api/cards')
@Roles(UserRole.CUSTOMER)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @ApiOkResponse({ type: [UserCardDto] })
  async getCards(@CurrentUser() user: IUser) {
    return this.cardsService.getUserCards(user.id);
  }

  @Delete(':id')
  @ApiOkResponse({ type: [UserCardDto] })
  async deleteCard(
    @CurrentUser() user: IUser,
    @Param('id') cardId: string,
  ): Promise<UserCardEntity[]> {
    try {
      await this.cardsService.deleteUserCard(user.id, cardId);

      return this.cardsService.getUserCards(user.id);
    } catch (err) {
      return err.message;
    }
  }

  @Put(':id/make-default')
  @ApiOkResponse({ type: [UserCardDto] })
  @ApiResponse({
    status: 404,
    description: `response will be { code: 404, message: 'Card not found' }`,
  })
  async updateDefaultCard(
    @CurrentUser() user: IUser,
    @Param('id') cardId: string,
  ) {
    try {
      await this.cardsService.updateDefaultCard(user.id, cardId);

      return this.cardsService.getUserCards(user.id);
    } catch (err) {
      return err.message;
    }
  }

  @Get('check-if-any-exists')
  @ApiOkResponse({ type: Boolean })
  async checkIfCardExists(@CurrentUser() user: IUser): Promise<boolean> {
    return this.cardsService.checkIfAnyExists(user.id);
  }
}
