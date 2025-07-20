import { Controller, Get, Request } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Public } from 'src/applications/guards/decorators/guard.decorator';
import { QueueProvider } from 'src/providers/queue.provider';

@Controller('health')
export class HealthController {
  constructor(
    private readonly queueProvider: QueueProvider,
    private readonly logger: PinoLogger,
  ) {}

  @Get()
  @Public()
  getHealth() {
    this.queueProvider.addJob({
      queueName: 'translate-queue',
      data: { message: 'Health check job translate queue' },
      options: { attempts: 3, delay: 1000 },
    });
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
