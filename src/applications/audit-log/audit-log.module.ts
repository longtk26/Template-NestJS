import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './interceptor/audit-log.interceptor';
import { AuditLogService } from './service/audit-log.service';
import { AuditLogRepository } from './repository/audit-log.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [
    AuditLogService,
    AuditLogRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
  exports: [AuditLogService],
})
export class AuditLogModule {}
