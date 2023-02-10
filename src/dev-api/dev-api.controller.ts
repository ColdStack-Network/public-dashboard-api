import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { IUser } from '../authnode-api/interfaces/user.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StripeApiService } from '../stripe-api/stripe-api.service';
import { DevApiService } from './dev-api.service';
import { UserStatus } from '../authnode-api/types/user-status.enum';
import { IsAuth } from '../authnode-api/guards/checkAuth';

@Controller('dev-api')
export class DevApiController {
  constructor(
    private devApiService: DevApiService,
    private stripeService: StripeApiService,
  ) {}

  @Post('user-reset')
  @UseGuards(IsAuth)
  async resetUser(@CurrentUser() user: IUser): Promise<IUser> {
    return await this.devApiService.resetUserProfile(user);
  }

  @Put('force-update-trial-end/:date')
  @UseGuards(IsAuth)
  async forceUpdateTrialEnd(
    @CurrentUser() user: IUser,
    @Param('date') date: Date,
  ): Promise<void> {
    await this.devApiService.forceUpdateTrialEnd(user, date);
  }

  @Post('delete-user-sub-and-card')
  async deleteUserSubAndCard(@Body() body: { userId: string }): Promise<void> {
    return await this.stripeService.deleteSubAndUserCard(body.userId);
  }

  @Put('update-user-status/:status')
  @UseGuards(IsAuth)
  async updateUserStatus(
    @CurrentUser() user: IUser,
    @Param('status') status: UserStatus,
  ): Promise<void> {
    await this.devApiService.updateUserStatus(user, status);
  }

  @Post('billing-transaction/failed')
  @UseGuards(IsAuth)
  async createFailedBillingTransaction(
    @CurrentUser() user: IUser,
  ): Promise<void> {
    await this.devApiService.createFailedBillingTransaction(user);
  }
}
