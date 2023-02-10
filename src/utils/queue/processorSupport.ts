import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { emailConfigsFactory } from '../../common/config/email.config';
import { TicketsEntity } from '../../entities/tickets.entity';
import { Mailer } from '../emailSendler';

@Processor('support')
export class EmailSupportConsumer {
  @OnQueueActive()
  onActive(job: Job<TicketsEntity>) {
    console.log(
      `Processing job ${job.id} of type 'send-support-message' on ${job.data.id}...`,
    );
  }
  @Process()
  async transcode(job: Job<TicketsEntity>) {
    console.log({ job });
    await Mailer.sendMail({
      template: 'support',
      dataInMessage: job.data,
      recipiens: emailConfigsFactory().supportEmail,
    });
    return {};
  }
}
