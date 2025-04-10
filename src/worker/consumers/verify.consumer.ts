import { WorkerHost, Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { MailService } from 'src/applications/mail/service/mail.service';
import { WorkerQueuesEnum } from '../worker.enum';

@Processor(WorkerQueuesEnum.SEND_EMAIL_VERIFICATION_QUEUE)
export class VerifyEmailConsumer extends WorkerHost {
  constructor(
    private readonly logger: PinoLogger,
    private readonly mailService: MailService,
  ) {
    super();
    this.logger.setContext(VerifyEmailConsumer.name);
  }

  async process(job: Job): Promise<any> {
    this.logger.info(`===Verify Email Consumer===`);
    this.logger.info(job.data);
    await this.mailService.sendMail({
      to: job.data.email,
      subject: 'Verify Email',
      content: '',
      html: `Please verify your email address by clicking this link: <a href="${job.data.link}">Verify Link</a>`,
    });

    return job.data;
  }
}
