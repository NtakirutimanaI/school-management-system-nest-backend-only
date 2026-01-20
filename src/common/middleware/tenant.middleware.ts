import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SchoolsService } from '../../schools/schools.service';

export interface RequestWithSchool extends Request {
    schoolId?: string;
    school?: any;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(private readonly schoolsService: SchoolsService) { }

    async use(req: RequestWithSchool, res: Response, next: NextFunction) {
        let schoolId: string | undefined;

        // Strategy 1: Get from subdomain (e.g., greenwood.schoolplatform.com)
        const host = req.get('host');
        if (host) {
            const subdomain = host.split('.')[0];
            if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
                try {
                    const school = await this.schoolsService.findBySubdomain(subdomain);
                    schoolId = school.id;
                    req.school = school;
                } catch (error) {
                    // Subdomain not found, try other strategies
                }
            }
        }

        // Strategy 2: Get from custom header (X-School-Id or X-School-Code)
        if (!schoolId) {
            const headerSchoolId = req.get('X-School-Id');
            const headerSchoolCode = req.get('X-School-Code');

            if (headerSchoolId) {
                schoolId = headerSchoolId;
                try {
                    const school = await this.schoolsService.findOne(schoolId);
                    req.school = school;
                } catch (error) {
                    // Invalid school ID
                }
            } else if (headerSchoolCode) {
                try {
                    const school = await this.schoolsService.findByCode(headerSchoolCode);
                    schoolId = school.id;
                    req.school = school;
                } catch (error) {
                    // Invalid school code
                }
            }
        }

        // Strategy 3: Get from JWT token (if user is authenticated)
        if (!schoolId && req.user) {
            schoolId = (req.user as any).schoolId;
            if (schoolId) {
                try {
                    const school = await this.schoolsService.findOne(schoolId);
                    req.school = school;
                } catch (error) {
                    // Invalid school ID in token
                }
            }
        }

        // Strategy 4: Get from query parameter (for public endpoints)
        if (!schoolId) {
            const querySchoolId = req.query.schoolId as string;
            if (querySchoolId) {
                schoolId = querySchoolId;
                try {
                    const school = await this.schoolsService.findOne(schoolId);
                    req.school = school;
                } catch (error) {
                    // Invalid school ID in query
                }
            }
        }

        // Attach schoolId to request
        if (schoolId) {
            req.schoolId = schoolId;

            // Validate subscription status
            if (req.school) {
                const isValid = await this.schoolsService.isSubscriptionValid(schoolId);
                if (!isValid) {
                    throw new UnauthorizedException(
                        'School subscription is expired or suspended',
                    );
                }
            }
        }

        // For super admin, allow access without schoolId
        const isSuperAdmin = (req.user as any)?.role === 'super_admin';
        if (!schoolId && !isSuperAdmin && !this.isPublicRoute(req.path)) {
            // For non-public routes, schoolId is required
            // But we'll allow it to pass and let guards handle it
        }

        next();
    }

    private isPublicRoute(path: string): boolean {
        const publicRoutes = [
            '/api/auth/login',
            '/api/auth/register',
            '/api/health',
            '/api/docs',
            '/api/schools/subdomain',
        ];

        return publicRoutes.some((route) => path.startsWith(route));
    }
}
