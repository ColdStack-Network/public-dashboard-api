import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthnodeApiModule } from '../authnode-api/authnode-api.module';
import { BillingTransactionRepository } from '../billing-api/repositories/billing-transaction.repository';
import { CommonService } from '../common/common.service';
import { StripeEventRepository } from '../stripe-api/repositories/stripe-event.repository';
import { UserCardRepository } from '../stripe-api/repositories/user-card.repository';
import { StripeApiWebhooksService } from '../stripe-api/stripe-api-webhooks.service';
import { StripeApiService } from '../stripe-api/stripe-api.service';
import { TariffRepository } from '../tariff-api/repositories/tariffs.repository';
import { UserPlanRepository } from '../tariff-api/repositories/userPlan.repository';
import { DevApiController } from './dev-api.controller';
import { DevApiService } from './dev-api.service';

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
        TariffRepository,
      ],
      'default',
    ),
  ],
  providers: [
    StripeApiService,
    DevApiService,
    StripeApiWebhooksService,
    CommonService,
    StripeApiService,
  ],
  controllers: [DevApiController],
})
export class DevApiModule {
  static forRoot(): DynamicModule {
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
      return {
        module: DevApiModule,
      };
    }

    return {
      module: class {},
    };
  }
}
