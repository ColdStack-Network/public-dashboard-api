import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GuideModule } from '../guide/guide.module';
import { StorageClassesController } from '../storage-classes/storage-classes.controller';
import { StorageClassesService } from '../storage-classes/storage-classes.service';
import { StorageClassesModule } from '../storage-classes/storage-classes.module';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from '../common/config';
import { TicketsModule } from '../tickets/tickets.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BillingApiModule } from '../billing-api/billing-api.module';
import { BullModule } from '@nestjs/bull';
import { redisConfigsFactory } from '../common/config/redis.config';
import { ConnectionOptionsReader } from 'typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { StatisticsModule } from '../statistics/statistics.module';
import { CeoApiModule } from '../ceo-api/ceo-api.module';
import { EmailConfigModule } from '../common/config/email.config';
import { StripeApiModule } from '../stripe-api/stripe-api.module';
import { TariffApiModule } from '../tariff-api/tariff-api.module';
import { DevApiModule } from '../dev-api/dev-api.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthnodeApiService } from '../authnode-api/authnode-api.service';
import { AdminModule } from '../admin/admin.module';
import { MailerApiService } from '../mailer-api/mailer-api.service';
import { CatalogModule } from '../catalog/catalog.module';
const redisConfig = redisConfigsFactory();

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    ScheduleModule.forRoot(),
    LoggerModule.forRoot(),
    TypeOrmModule.forRootAsync({
      name: 'billing_db',
      useFactory: async () => {
        const options = await new ConnectionOptionsReader().all();

        return options.find((options) => options.name === 'billing_db');
      },
    }),
    TypeOrmModule.forRootAsync({
      name: 'filenode_db',
      useFactory: async () => {
        const options = await new ConnectionOptionsReader().all();

        return options.find((options) => options.name === 'filenode_db');
      },
    }),
    TypeOrmModule.forRootAsync({
      name: 'authnode_db',
      useFactory: async () => {
        const options = await new ConnectionOptionsReader().all();

        return options.find((options) => options.name === 'authnode_db');
      },
    }),
    GuideModule,
    StorageClassesModule,
    ConfigModule.forRoot(configModuleOptions),
    NotificationsModule,
    TicketsModule,
    BillingApiModule,
    StripeApiModule,
    StatisticsModule,
    TariffApiModule,
    CatalogModule,
    AdminModule,
    DevApiModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: redisConfig.host,
        port: Number(redisConfig.port),
        password: redisConfig.password,
      },
      prefix: 'queue',
    }),
    CeoApiModule,
    ConfigModule.forRoot(EmailConfigModule),
  ],
  controllers: [AppController, StorageClassesController],
  providers: [
    AuthnodeApiService,
    MailerApiService,
    StorageClassesService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
