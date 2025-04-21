export interface AuditLogData {
  action: string;
  description: string;
  userId: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, any>;
}

export interface AuditLogCreateDto {
  action: string;
  description: string;
  userId: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, any>;
}
