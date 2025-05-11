import { Module } from '@nestjs/common';
import { UserModule } from './applications/user/user.module';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { LoggerModule } from 'nestjs-pino';
import { specConfigsPino } from './config/logger';
import { RedisModule } from './core/cache/redis.module';
import { WorkerModule } from './worker/worker.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { HealthModule } from './applications/health/health.module';
import { GuardModule } from './applications/guards/guard.module';
import { AuthModule } from './applications/auth/auth.module';
import { AppClsModule } from './core/cls/cls.module';
import { AuditLogModule } from './applications/audit-log/audit-log.module';
import { validateEnv } from './config/env.validation';
import { ProjectModule } from './applications/project/project.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnv,
      validationOptions: {
        abortEarly: true,
        allowUnknown: false,
      },
      isGlobal: true,
      load: [config],
    }),
    LoggerModule.forRoot(specConfigsPino),
    HealthModule,
    UserModule,
    AuthModule,
    GuardModule,
    AppClsModule,
    RedisModule,
    WorkerModule,
    AuditLogModule,
    ProjectModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
