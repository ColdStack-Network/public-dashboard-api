import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { XApiToken } from '../authnode-api/guards/checkAuth';
import { IUser } from '../authnode-api/interfaces/user.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TariffDto } from './dto/tariff.dto';
import { UserPlanDto } from './dto/userPlan.dto';
import { TariffService } from './tariff.service';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPlanRepository } from './repositories/userPlan.repository';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../authnode-api/types/user-role.enum';

@ApiTags('tariff')
@Controller('tariff')
@Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPERADMIN)
export class TariffApiController {
  constructor(
    private tariffService: TariffService,
    @InjectRepository(UserPlanRepository, 'default')
    private readonly userPlanRepo: UserPlanRepository,
  ) {}

  @Get('all')
  @ApiOkResponse({ type: [TariffDto] })
  async getAll() {
    return this.tariffService.getAll();
  }

  @Get('user-plan')
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer jwtToken',
  })
  @ApiOkResponse({ type: UserPlanDto })
  @ApiResponse({
    status: 404,
    description: `response will be { code: 404, message: 'User plan not found' }`,
  })
  async getPlanHistory(@CurrentUser() user: IUser) {
    if (user.tariffId == null) {
      throw new NotFoundException('User plan is not set');
    }

    return await this.tariffService.getUserPlan(user);
  }

  @Put('switch-to/:id')
  @ApiOkResponse({ type: UserPlanDto })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer jwtToken',
  })
  async changeUserPlan(
    @Res() res: Response,
    @CurrentUser() user: IUser,
    @Param('id') tariffId: number,
  ) {
    try {
      if (user.tariffId === tariffId || user.nextTariffId === tariffId) {
        throw new Error('You cannot switch to the existing tariff');
      }

      const { userPlan, transactionId } =
        await this.tariffService.changeUserPlan(user, tariffId);

      res.status(200).send({ userPlan, transactionId });
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

  @Post('cancel-next')
  @ApiOkResponse()
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer jwtToken',
  })
  async cancelNextTariff(@Res() res: Response, @CurrentUser() user: IUser) {
    try {
      if (user.nextTariffId && user.nextTariffId !== user.tariffId) {
        await this.tariffService.cancelNextTariff(user);
      }

      res.sendStatus(200);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

  @Post('initialize-user')
  @ApiOkResponse()
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer jwtToken',
  })
  async initializeUser(@Res() res: Response, @CurrentUser() user: IUser) {
    await this.tariffService.initializeUser(user);

    res.sendStatus(200);
  }

  @UseGuards(XApiToken)
  @Post('setTrialUserPlan/:userId')
  async setTrialUserPlan(
    @Res() res: Response,
    @Param('userId') userId: string,
  ) {
    try {
      const rep = await this.tariffService.setTrialUserPlan(userId);
      res.sendStatus(200);
      res.send(rep);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
}
