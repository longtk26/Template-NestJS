import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { AuditLogRepository } from '../repository/audit-log.repository';
import { AuditLogCreateDto } from '../interfaces/audit-log.interface';
import { AuditLog } from '@prisma/client';

@Injectable()
export class AuditLogService {
  constructor(
    private readonly auditLogRepository: AuditLogRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuditLogService.name);
  }

  async createLog(auditLogData: AuditLogCreateDto): Promise<AuditLog> {
    try {
      this.logger.info(`Creating audit log: ${JSON.stringify(auditLogData)}`);
      return await this.auditLogRepository.createAuditLog(auditLogData);
    } catch (error) {
      this.logger.error(`Error creating audit log: ${error.message}`);
      // We don't want to throw errors from audit logging as it's a non-critical operation
      return null;
    }
  }

  async getLogsByUserId(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.getAuditLogsByUserId(userId);
  }

  async getLogsByTargetId(targetId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.getAuditLogsByTargetId(targetId);
  }
}
