import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../entities/audit-log.entity';

export const AUDIT_LOG_KEY = 'audit_log';

export interface AuditLogMetadata {
    action: AuditAction;
    entityType?: string;
    description?: string;
}

/**
 * Decorator to mark methods that should be audited
 * 
 * @example
 * @AuditLog({ action: AuditAction.USER_CREATED, entityType: 'User' })
 * async createUser(dto: CreateUserDto) { ... }
 */
export const AuditLog = (metadata: AuditLogMetadata) =>
    SetMetadata(AUDIT_LOG_KEY, metadata);
