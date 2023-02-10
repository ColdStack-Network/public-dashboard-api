import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationEntity } from '../../entities/notification.entity';
import { Mailer } from '../emailSendler';

@Processor('email')
export class EmailConsumer {
  @OnQueueActive()
  onActive(
    job: Job<{
      email: string;
      notification: NotificationEntity;
    }>,
  ) {
    console.log(
      `Processing job ${job.id} of type 'send-email' on ${job.data.email}...`,
    );
  }
  @Process()
  async transcode(
    job: Job<{
      email: string;
      notification: NotificationEntity;
    }>,
  ) {
    await Mailer.sendMail({
      template: 'base',
      dataInMessage: {
        title: job.data.notification.title,
        descriptions: job.data.notification.description,
      },
      recipiens: job.data.email,
    });
    return {};
  }
}
