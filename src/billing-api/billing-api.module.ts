import { Module } from '@nestjs/common';
import { BillingApiController } from './billing-api.controller';
import { PredictPricesService } from './predict-prices.service';
import { AuthnodeApiModule } from '../authnode-api/authnode-api.module';
import { BillingSevice } from './billing.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TariffRepository } from '../tariff-api/repositories/tariffs.repository';
import { UserPlanRepository } from '../tariff-api/repositories/userPlan.repository';
import { TariffService } from '../tariff-api/tariff.service';
import { UserCardRepository } from '../stripe-api/repositories/user-card.repository';
import { CardsModule } from './cards/cards.module';
import { BillingTransactionRepository } from './repositories/billing-transaction.repository';
import { StripeApiService } from '../stripe-api/stripe-api.service';
import { StripeEventRepository } from '../stripe-api/repositories/stripe-event.repository';
import { StripeApiWebhooksService } from '../stripe-api/stripe-api-webhooks.service';
import { AuthnodeApiService } from '../authnode-api/authnode-api.service';
import { CommonService } from '../common/common.service';

@Module({
  imports: [
    AuthnodeApiModule,
    TypeOrmModule.forFeature(
      [
        TariffRepository,
        UserPlanRepository,
        UserCardRepository,
        BillingTransactionRepository,
        StripeEventRepository,
      ],
      'default',
    ),
    CardsModule,
  ],
  providers: [
    PredictPricesService,
    BillingSevice,
    TariffService,
    StripeApiService,
    AuthnodeApiService,
    StripeApiWebhooksService,
    CommonService,
  ],
  controllers: [BillingApiController],
})
export class BillingApiModule {}
