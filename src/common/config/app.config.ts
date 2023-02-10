import { registerAs, ConfigType } from '@nestjs/config';
import { checkMissedVariables } from '../../utils/checkMissedVariables';

export function appConfigsFactory() {
  const port = parseInt(process.env.PORT);
  const host = process.env.HOST;
  const corsOrigins = JSON.parse(process.env.CORS_ORIGINS);

  const authnodeUrl = process.env.AUTHNODE_URL;
  const mailerApiUrl = process.env.MAILER_URL;
  const jwtSecret = process.env.JWT_SECRET;
  const billingApi = process.env.BILLING_API;
  const withdrawalRequestsTelegramBotToken =
    process.env.WITHDRAWAL_REQUESTS_TELEGRAM_BOT_TOKEN;
  const withdrawalRequestsTelegramChatId =
    process.env.WITHDRAWAL_REQUESTS_TELEGRAM_CHAT_ID;

  const createNotificationIps = (
    process.env.CREATE_NOTIFICATION_IPS || ''
  ).split(',');

  const supportRequestsTelegramBotToken =
    process.env.SUPPORT_REQUESTS_TELEGRAM_BOT_TOKEN;
  const supportRequestsTelegramChatId =
    process.env.SUPPORT_REQUESTS_TELEGRAM_CHAT_ID;
  const supportTicketsTelegramChatId =
    process.env.SUPPORT_TICKETS_TELEGRAM_CHAT_ID;

  const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
  const stripePrivateKey = process.env.STRIPE_PRIVATE_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const stripeTestCustomer = process.env.STRIPE_TEST_CUSTOMER;

  const missingKey = checkMissedVariables({
    port,
    host,
    authnodeUrl,
    mailerApiUrl,
    jwtSecret,
    billingApi,
    supportRequestsTelegramBotToken,
    supportRequestsTelegramChatId,
    supportTicketsTelegramChatId,
  });

  if (missingKey) {
    throw new Error(`Config key ${missingKey} is missing.`);
  }

  return registerAs('app', () => ({
    isDevEnv: process.env.NODE_ENV !== 'production',
    port,
    host,
    corsOrigins,
    authnodeUrl,
    mailerApiUrl,
    jwtSecret,
    billingApi,
    withdrawalRequestsNotifications: {
      botToken: withdrawalRequestsTelegramBotToken as string | void,
      chatId: withdrawalRequestsTelegramChatId as string | void,
    },
    createNotificationIps,
    supportRequestNotifications: {
      botToken: supportRequestsTelegramBotToken as string | void,
      chatId: supportRequestsTelegramChatId as string | void,
    },
    supportTicketsNotifications: {
      botToken: supportRequestsTelegramBotToken as string | void,
      chatId: supportTicketsTelegramChatId as string | void,
    },
    stripe: {
      publicKey: stripePublicKey as string,
      privateKey: stripePrivateKey as string,
      test: {
        customer: stripeTestCustomer,
      },
      webhookSecret: stripeWebhookSecret as string,
    },
    domain: {
      url: process.env.DOMAIN
      env: process.env.NODE_ENV,
    },
    xApiKey: 'MQKDNXAKKMPkTXFJw45F',
  }));
}

export type TAppConfigs = ConfigType<typeof appConfigsFactory>;
