import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/repository/base.repository';
import { AuditLog, Prisma } from '@prisma/client';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { AuditLogCreateDto } from '../interfaces/audit-log.interface';

@Injectable()
export class AuditLogRepository extends BaseRepository<
  AuditLog,
  Prisma.AuditLogCreateInput,
  Prisma.AuditLogWhereInput
> {
  protected readonly modelName: string = 'auditLog';

  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost);
  }

  async createAuditLog(auditLogData: AuditLogCreateDto): Promise<AuditLog> {
    return this.prisma.tx.auditLog.create({
      data: {
        action: auditLogData.action,
        description: auditLogData.description,
        user: {
          connect: {
            id: auditLogData.userId,
          },
        },
        targetId: auditLogData.targetId,
        targetType: auditLogData.targetType,
        metadata: auditLogData.metadata || {},
      },
    });
  }

  async getAuditLogsByUserId(userId: string): Promise<AuditLog[]> {
    return this.prisma.tx.auditLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAuditLogsByTargetId(targetId: string): Promise<AuditLog[]> {
    return this.prisma.tx.auditLog.findMany({
      where: {
        targetId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
