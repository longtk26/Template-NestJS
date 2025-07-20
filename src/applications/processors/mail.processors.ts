import { OnWorkerEvent, WorkerHost, Processor } from '@nestjs/bullmq';
import { QueueName } from 'src/constants/queue.constants';

@Processor(QueueName.MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
  async process(job: any): Promise<void> {
    // Implement the logic to process the mail job
    console.log(`Processing mail job with ID: ${job.id} and data:`, job.data);
    // Add your mail sending logic here
  }

  @OnWorkerEvent('completed')
  onCompleted(job: any): void {
    console.log(`Job completed: ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: any, error: Error): void {
    console.error(`Job failed: ${job.id}, Error: ${error.message}`);
  }
}
