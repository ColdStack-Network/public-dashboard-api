import { ConfigType, registerAs } from '@nestjs/config';
import { checkMissedVariables } from '../../utils/checkMissedVariables';

export function emailConfigsFactory() {
  const emailSmtp = process.env.EMAIL_SMTP;
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const sendEmail = Boolean(process.env.EMAIL_SEND);
  const supportEmail = process.env.SUPPORT_EMAIL;
  const sendGridApiKey = process.env.SENDGRID_API_KEY;

  const missingKey = checkMissedVariables({
    emailSmtp,
    emailUser,
    emailPassword,
    sendEmail,
    supportEmail,
    sendGridApiKey,
  });

  if (missingKey) {
    throw new Error(`Config key ${missingKey} is missing.`);
  }

  return {
    smtp: emailSmtp,
    user: emailUser,
    password: emailPassword,
    send: sendEmail,
    supportEmail,
    sendGridApiKey,
  };
}

const emailCfg = registerAs('emailConfig', emailConfigsFactory);

export const EmailConfigModule = {
  load: [emailCfg],
  isGlobal: true,
};
export const EMAIL_CONFIG_KEYS = emailCfg.KEY;
export type TEmailConfig = ConfigType<typeof emailCfg>;
