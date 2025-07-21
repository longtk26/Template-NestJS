import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PinoLogger } from 'nestjs-pino';
import { SSEService } from '../sse/sse.service';

@Injectable()
export class TranslateCronjob {
  constructor(
    private readonly logger: PinoLogger,
    private readonly sseService: SSEService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    this.logger.info('Translate cronjob started');
    this.sseService.emitEventsBySubject({
      subject: 'job-update',
      data: {
        data: JSON.stringify({
          message: 'Cronjob update executed successfully',
          timestamp: new Date().toISOString(),
        }),
      },
    });
  }
}
