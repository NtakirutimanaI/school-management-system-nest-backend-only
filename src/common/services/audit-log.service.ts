import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

export interface AuditLogData {
    action: AuditAction;
    userId?: string;
    userEmail?: string;
    userRole?: string;
    schoolId?: string;
    entityType?: string;
    entityId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
}

@Injectable()
export class AuditLogService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
    ) { }

    /**
     * Create an audit log entry
     */
    async log(data: AuditLogData): Promise<AuditLog> {
        try {
            const auditLog = this.auditLogRepository.create(data);
            const saved = await this.auditLogRepository.save(auditLog);

            // Also log to Winston for redundancy
            this.logger.info('Audit log created', {
                context: 'AuditLogService',
                action: data.action,
                userId: data.userId,
                entityType: data.entityType,
                entityId: data.entityId,
            });

            return saved;
        } catch (error) {
            this.logger.error('Failed to create audit log', {
                context: 'AuditLogService',
                error: error.message,
                data,
            });
            throw error;
        }
    }

    /**
     * Get audit logs with filtering
     */
    async findAll(filters: {
        userId?: string;
        schoolId?: string;
        action?: AuditAction;
        entityType?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{ data: AuditLog[]; total: number }> {
        const query = this.auditLogRepository.createQueryBuilder('audit');

        if (filters.userId) {
            query.andWhere('audit.userId = :userId', { userId: filters.userId });
        }

        if (filters.schoolId) {
            query.andWhere('audit.schoolId = :schoolId', {
                schoolId: filters.schoolId,
            });
        }

        if (filters.action) {
            query.andWhere('audit.action = :action', { action: filters.action });
        }

        if (filters.entityType) {
            query.andWhere('audit.entityType = :entityType', {
                entityType: filters.entityType,
            });
        }

        if (filters.startDate) {
            query.andWhere('audit.createdAt >= :startDate', {
                startDate: filters.startDate,
            });
        }

        if (filters.endDate) {
            query.andWhere('audit.createdAt <= :endDate', {
                endDate: filters.endDate,
            });
        }

        query.orderBy('audit.createdAt', 'DESC');

        const total = await query.getCount();

        if (filters.limit) {
            query.limit(filters.limit);
        }

        if (filters.offset) {
            query.offset(filters.offset);
        }

        const data = await query.getMany();

        return { data, total };
    }

    /**
     * Get audit logs for a specific entity
     */
    async findByEntity(
        entityType: string,
        entityId: string,
    ): Promise<AuditLog[]> {
        return this.auditLogRepository.find({
            where: { entityType, entityId },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Get recent audit logs for a user
     */
    async findByUser(userId: string, limit = 50): Promise<AuditLog[]> {
        return this.auditLogRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    /**
     * Get failed login attempts
     */
    async getFailedLoginAttempts(
        email: string,
        since: Date,
    ): Promise<AuditLog[]> {
        return this.auditLogRepository.find({
            where: {
                action: AuditAction.USER_LOGIN_FAILED,
                userEmail: email,
            },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Clean up old audit logs (for GDPR compliance)
     */
    async cleanup(olderThan: Date): Promise<number> {
        const result = await this.auditLogRepository
            .createQueryBuilder()
            .delete()
            .where('createdAt < :date', { date: olderThan })
            .execute();

        this.logger.info('Audit logs cleaned up', {
            context: 'AuditLogService',
            deletedCount: result.affected,
            olderThan,
        });

        return result.affected || 0;
    }
}
