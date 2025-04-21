import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_DATA = 'AUDIT_LOG_DATA';

/**
 * Decorator to mark methods that should be audited
 *
 * @param message Template message for the audit log entry
 * Use placeholders like <name_admin> for the current user's name
 * Use <name_user> for the target user's name (from request body or response)
 * Use on .... to include a timestamp
 *
 * Example: @AuditLog('<name_admin> have created <name_user> on ....')
 */
export const AuditLog = (message: string) =>
  SetMetadata(AUDIT_LOG_DATA, message);
