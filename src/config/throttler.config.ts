import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerModuleOptions = {
    throttlers: [
        {
            name: 'short',
            ttl: 1000, // 1 second
            limit: 10, // 10 requests per second
        },
        {
            name: 'medium',
            ttl: 10000, // 10 seconds
            limit: 50, // 50 requests per 10 seconds
        },
        {
            name: 'long',
            ttl: 60000, // 1 minute
            limit: 100, // 100 requests per minute
        },
    ],
};

// Custom rate limits for specific endpoints
export const customThrottlerLimits = {
    // Auth endpoints - stricter limits
    login: {
        ttl: 900000, // 15 minutes
        limit: 5, // 5 attempts per 15 minutes
    },
    register: {
        ttl: 3600000, // 1 hour
        limit: 3, // 3 registrations per hour
    },
    resetPassword: {
        ttl: 3600000, // 1 hour
        limit: 3, // 3 reset requests per hour
    },

    // File upload - moderate limits
    upload: {
        ttl: 60000, // 1 minute
        limit: 10, // 10 uploads per minute
    },

    // Public endpoints - relaxed limits
    public: {
        ttl: 60000, // 1 minute
        limit: 200, // 200 requests per minute
    },
};
