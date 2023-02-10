import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthnodeApiModule } from '../authnode-api/authnode-api.module';
import { BillingTransactionRepository } from '../billing-api/repositories/billing-transaction.repository';
import { CommonService } from '../common/common.service';
import { StripeEventRepository } from '../stripe-api/repositories/stripe-event.repository';
import { UserCardRepository } from '../stripe-api/repositories/user-card.repository';
import { StripeApiWebhooksService } from '../stripe-api/stripe-api-webhooks.service';
import { StripeApiService } from '../stripe-api/stripe-api.service';
import { TariffRepository } from './repositories/tariffs.repository';
import { UserPlanRepository } from './repositories/userPlan.repository';
import { TariffApiController } from './tariff-api.controller';
import { TariffService } from './tariff.service';

@Module({
  imports: [
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
    AuthnodeApiModule,
  ],
  providers: [
    TariffService,
    StripeApiService,
    StripeApiWebhooksService,
    CommonService,
  ],
  controllers: [TariffApiController],
})
export class TariffApiModule {}
