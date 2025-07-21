import { Module } from '@nestjs/common';
import { UserModule } from './applications/user/user.module';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { LoggerModule } from 'nestjs-pino';
import { specConfigsPino } from './config/logger';
import { RedisModule } from './core/cache/redis.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { HealthModule } from './applications/health/health.module';
import { GuardModule } from './applications/guards/guard.module';
import { QueueModule } from './providers/queue.module';
import { CronjobModule } from './applications/cronjob/cronjob.module';
import { SSEModule } from './applications/sse/sse.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    LoggerModule.forRoot(specConfigsPino),
    HealthModule,
    UserModule,
    GuardModule,
    RedisModule,
    QueueModule,
    CronjobModule,
    SSEModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
