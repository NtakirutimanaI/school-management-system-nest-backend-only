import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../services/audit-log.service';
import { AUDIT_LOG_KEY, AuditLogMetadata } from '../decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    constructor(
        private readonly reflector: Reflector,
        private readonly auditLogService: AuditLogService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const auditMetadata = this.reflector.get<AuditLogMetadata>(
            AUDIT_LOG_KEY,
            context.getHandler(),
        );

        if (!auditMetadata) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const schoolId = request.schoolId || user?.schoolId;

        return next.handle().pipe(
            tap(async (result) => {
                try {
                    // Extract entity ID from result if available
                    const entityId = result?.id || result?.data?.id;

                    await this.auditLogService.log({
                        action: auditMetadata.action,
                        userId: user?.id,
                        userEmail: user?.email,
                        userRole: user?.role,
                        schoolId,
                        entityType: auditMetadata.entityType,
                        entityId,
                        description: auditMetadata.description,
                        ipAddress: request.ip || request.connection.remoteAddress,
                        userAgent: request.headers['user-agent'],
                        metadata: {
                            method: request.method,
                            url: request.url,
                            body: this.sanitizeBody(request.body),
                        },
                    });
                } catch (error) {
                    // Don't fail the request if audit logging fails
                    console.error('Audit logging failed:', error);
                }
            }),
        );
    }

    /**
     * Remove sensitive data from request body before logging
     */
    private sanitizeBody(body: any): any {
        if (!body) return body;

        const sanitized = { ...body };
        const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];

        for (const field of sensitiveFields) {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        }

        return sanitized;
    }
}
