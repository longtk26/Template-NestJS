import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BrokerConfig } from 'src/config/interface';
import { ConfigEnum } from 'src/config/config';
import { registerConsumerQueues, registerWorkerQueues } from './worker.queues';
import { WorkerProducer } from './worker.producer';
import { MailModule } from 'src/applications/mail/mail.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<BrokerConfig>(ConfigEnum.BROKER_CONFIG).host,
          port: parseInt(
            configService.get<BrokerConfig>(ConfigEnum.BROKER_CONFIG).port,
          ),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(...registerWorkerQueues()),
    MailModule,
  ],
  providers: [WorkerProducer, ...registerConsumerQueues()],
  exports: [WorkerProducer],
})
export class WorkerModule {}
