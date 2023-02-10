import {
  Controller,
  Delete,
  Get,
  HttpException,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOkResponse } from '@nestjs/swagger';
import { IsAuth } from '../authnode-api/guards/checkAuth';
import { IUser } from '../authnode-api/interfaces/user.interface';
import { UserRole } from '../authnode-api/types/user-role.enum';
import { UserStatus } from '../authnode-api/types/user-status.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { BillingSevice } from './billing.service';
import { UsageDto } from './dto/billing.dto';
import { CostsEstimatorInputs } from './dto/costs-calc.dto';
import { GetBillingTransactionsRequestQueryDto } from './dto/get-billing-transactions-query.dto';
import { GetBillingTransactionsResponseDto } from './dto/get-billing-transactions-response.dto';
import { NewUserStatusDto } from './dto/newUserStatus.dto';
import { PaymentStatusDto } from './dto/payment-status.sto';
import { PredictPricesService } from './predict-prices.service';

@Controller('billing')
@Roles(UserRole.CUSTOMER)
export class BillingApiController {
  constructor(
    private readonly predictPricesService: PredictPricesService,
    private readonly billingService: BillingSevice,
  ) {}

  @Get('costs-estimator-params')
  @ApiOkResponse({ type: () => CostsEstimatorInputs })
  async calculateCosts(): Promise<CostsEstimatorInputs> {
    return this.predictPricesService.getCostsEstimatorParams();
  }

  @Get('storage-usage')
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer jwtToken',
  })
  @ApiOkResponse({ type: () => UsageDto })
  async getStorageUsage(@CurrentUser() user: IUser): Promise<UsageDto> {
    return this.billingService.getStorageUsage(user);
  }

  @Get('bandwidth-usage')
  @ApiOkResponse({ type: () => UsageDto })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer jwtToken',
  })
  async getBandwidthUsage(@CurrentUser() user: IUser): Promise<UsageDto> {
    return this.billingService.getBandwidthUsage(user);
  }

  @Get('history')
  @ApiOkResponse({ type: () => GetBillingTransactionsResponseDto })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer jwtToken',
  })
  async getBillingHistory(
    @Query() query: GetBillingTransactionsRequestQueryDto,
    @CurrentUser() user: IUser,
  ): Promise<GetBillingTransactionsResponseDto> {
    return this.billingService.getBillingHistory(user, query);
  }

  @Get('payment-status/:id')
  @ApiOkResponse({ type: () => PaymentStatusDto })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer jwtToken',
  })
  async getBillingTransactionPaymentStatus(
    @Param('id') id: string,
  ): Promise<PaymentStatusDto> {
    const resp = await this.billingService.getBillingTransactionPaymentStatus(
      id,
    );

    if (resp) {
      return { status: resp.status, reason: resp.reason };
    }

    throw new NotFoundException(
      `Billing transaction with id ${id} was not found`,
    );
  }

  @Delete('subscriptions')
  @ApiOkResponse({ type: () => NewUserStatusDto })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer jwtToken',
  })
  async deleteSubscriptions(
    @CurrentUser() user: IUser,
  ): Promise<NewUserStatusDto> {
    if (user.nextTariffId) {
      throw new HttpException('You cannot cancel current subscription', 400);
    }

    await this.billingService.deleteSubscriptions(user);

    return new NewUserStatusDto(UserStatus.Unsubscribed);
  }

  @Post('subscription/renovate')
  @ApiOkResponse()
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer jwtToken',
  })
  async renovateSubscription(@CurrentUser() user: IUser): Promise<void> {
    await this.billingService.renovateSubscription(user);
  }
}
