import path from 'path';
import nodemailer from 'nodemailer';
import nodemailerSendgrid from 'nodemailer-sendgrid';
import EmailTemplates from 'email-templates';
import { emailConfigsFactory } from '../common/config/email.config';
import { IMailLocals } from './interfaces/sendMail.interface';

const emailConfig = emailConfigsFactory();

export class Mailer {
  private static rootViews = path.resolve('src/email-template');
  private static transport = nodemailer.createTransport(
    nodemailerSendgrid({
      apiKey: emailConfig.sendGridApiKey,
    }),
  );

  private static emailTempaltes: EmailTemplates<unknown> = new EmailTemplates({
    views: {
      root: this.rootViews,
    },
    transport: this.transport,
    send: emailConfig.send,
  });

  static async sendMail(locals?: IMailLocals): Promise<void> {
    try {
      if (!locals.recipiens) {
        console.log('Email is empty');
        return;
      }
      await Mailer.emailTempaltes
        .send({
          template: locals.template,
          message: {
            from: emailConfig.user,
            to: locals.recipiens,
            attachments:
              locals.dataInMessage.file?.length > 0
                ? locals.dataInMessage.file.map((x) => ({
                    filename: '',
                    path: x,
                  }))
                : [],
          },
          locals: locals.dataInMessage,
        })
        .then(() => {
          console.log(`Email has been send to ${locals.recipiens}`);
        })
        .catch((err) => {
          console.error('Send email error:', err);
        });
    } catch (err) {
      console.log(err);
    }
  }
}
