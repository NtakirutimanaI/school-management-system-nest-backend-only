import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const SKIP_TENANT_CHECK = 'skipTenantCheck';

/**
 * Guard to ensure that a valid schoolId is present in the request
 * Prevents cross-tenant data access
 */
@Injectable()
export class TenantGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Check if tenant check should be skipped (for super admin or public routes)
        const skipTenantCheck = this.reflector.getAllAndOverride<boolean>(
            SKIP_TENANT_CHECK,
            [context.getHandler(), context.getClass()],
        );

        if (skipTenantCheck) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const schoolId = request.schoolId;

        // Super admin can access all schools
        if (user?.role === 'super_admin') {
            return true;
        }

        // For other users, schoolId must be present
        if (!schoolId) {
            throw new ForbiddenException(
                'School context is required. Please provide a valid school identifier.',
            );
        }

        // Ensure user belongs to the same school
        if (user && user.schoolId && user.schoolId !== schoolId) {
            throw new ForbiddenException(
                'You do not have access to this school\'s data.',
            );
        }

        return true;
    }
}

/**
 * Decorator to skip tenant check for specific routes
 * Use for super admin endpoints or public routes
 * 
 * @example
 * @SkipTenantCheck()
 * @Get('all-schools')
 * findAllSchools() { ... }
 */
export const SkipTenantCheck = () =>
    Reflect.metadata(SKIP_TENANT_CHECK, true);
