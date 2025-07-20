import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BrokerConfig } from 'src/config/interface';
import { ConfigEnum } from 'src/config/config';
import { ProcessorsModule } from 'src/applications/processors/processors.module';
import { QueueProvider } from './queue.provider';

@Global()
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
    ProcessorsModule,
  ],
  providers: [QueueProvider],
  exports: [QueueProvider],
})
export class QueueModule {}
