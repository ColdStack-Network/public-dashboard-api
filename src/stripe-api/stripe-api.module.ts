import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthnodeApiModule } from '../authnode-api/authnode-api.module';
import { BillingTransactionRepository } from '../billing-api/repositories/billing-transaction.repository';
import { CommonService } from '../common/common.service';
import { TariffRepository } from '../tariff-api/repositories/tariffs.repository';
import { UserPlanRepository } from '../tariff-api/repositories/userPlan.repository';
import { StripeEventRepository } from './repositories/stripe-event.repository';
import { UserCardRepository } from './repositories/user-card.repository';
import { StripeApiWebhooksService } from './stripe-api-webhooks.service';
import { StripeApiController } from './stripe-api.controller';
import { StripeApiService } from './stripe-api.service';

@Module({
  imports: [
    AuthnodeApiModule,
    TypeOrmModule.forFeature(
      [
        TariffRepository,
        UserPlanRepository,
        UserCardRepository,
        StripeEventRepository,
        BillingTransactionRepository,
      ],
      'default',
    ),
  ],
  controllers: [StripeApiController],
  providers: [StripeApiService, StripeApiWebhooksService, CommonService],
})
export class StripeApiModule {}
