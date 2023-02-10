import { Inject, Injectable } from '@nestjs/common';
import sgMail, { MailService } from '@sendgrid/mail';
import { EMAIL_CONFIG_KEYS, TEmailConfig } from '../common/config/email.config';
import glob from 'glob';
import Handlebars from 'handlebars';
import fs from 'fs';

export enum EmailTempaltes {
  migration = 'migration-email.hbs',
}

type SendEmailProps = {
  to: string;
  emailTemplate: EmailTempaltes;
  dynamic_template_data?: Record<string, unknown>;
  subject: string;
};

@Injectable()
export class SendGridService {
  private sgMail: MailService;
  private templates: Record<string, HandlebarsTemplateDelegate> = {};

  constructor(
    @Inject(EMAIL_CONFIG_KEYS)
    private readonly emailConfig: TEmailConfig,
  ) {
    this.sgMail = sgMail;
    this.sgMail.setApiKey(this.emailConfig.sendGridApiKey);
    this.init();
  }

  getTemplateName(string: string): string {
    return string.substring(string.lastIndexOf('/') + 1);
  }
  async readFile(filePath: string): Promise<string> {
    return new Promise<string>((res, rej) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          return rej(err);
        }
        res(data.toString());
      });
    });
  }
  async init() {
    const filePathes = glob.sync(
      `${process.cwd()}/src/services/emailTemplates/**.hbs`,
    );

    for (const filePath of filePathes) {
      const fileName = this.getTemplateName(filePath);
      const file = await this.readFile(filePath);
      const hbsTemplate = Handlebars.compile(file);
      this.templates[fileName] = hbsTemplate;
    }
  }

  async sendEmailFromSupport({
    to,
    emailTemplate,
    dynamic_template_data,
    subject,
  }: SendEmailProps): Promise<boolean> {
    const template = this.templates[emailTemplate];

    const msg = {
      to,
      from: process.env.MAIL_FROM,
      subject,
      html: template(dynamic_template_data),
    };
    await this.sgMail.send(msg);
    return true;
  }
}
