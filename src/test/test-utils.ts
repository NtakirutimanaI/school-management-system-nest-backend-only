import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

/**
 * Create a mock repository with common methods
 */
export const createMockRepository = <T extends Record<string, any> = any>(): Partial<Repository<T>> => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
        getCount: jest.fn(),
        getManyAndCount: jest.fn(),
        execute: jest.fn(),
    })) as any,
});

/**
 * Create a testing module with common providers
 */
export const createTestingModule = async (
    providers: any[],
    imports: any[] = [],
): Promise<TestingModule> => {
    return Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env.test',
            }),
            ...imports,
        ],
        providers,
    }).compile();
};

/**
 * Mock user for testing
 */
export const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    role: 'student',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

/**
 * Mock admin user for testing
 */
export const mockAdmin = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'admin@example.com',
    username: 'admin',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

/**
 * Mock super admin user for testing
 */
export const mockSuperAdmin = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    email: 'superadmin@example.com',
    username: 'superadmin',
    role: 'super_admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

/**
 * Mock JWT service
 */
export const mockJwtService = {
    sign: jest.fn(() => 'mock-jwt-token'),
    verify: jest.fn(() => ({ userId: mockUser.id })),
    decode: jest.fn(() => ({ userId: mockUser.id })),
};

/**
 * Mock config service
 */
export const mockConfigService = {
    get: jest.fn((key: string) => {
        const config = {
            JWT_SECRET: 'test-secret',
            JWT_EXPIRES_IN: '7d',
            DB_HOST: 'localhost',
            DB_PORT: 5432,
            NODE_ENV: 'test',
        };
        return config[key];
    }),
};

/**
 * Mock mailer service
 */
export const mockMailerService = {
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'mock-message-id' })),
};

/**
 * Mock audit log service
 */
export const mockAuditLogService = {
    log: jest.fn(() => Promise.resolve()),
    findAll: jest.fn(() => Promise.resolve({ data: [], total: 0 })),
    findByEntity: jest.fn(() => Promise.resolve([])),
    findByUser: jest.fn(() => Promise.resolve([])),
};

/**
 * Mock logger
 */
export const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
};

/**
 * Helper to clear all mocks
 */
export const clearAllMocks = () => {
    jest.clearAllMocks();
};

/**
 * Helper to wait for async operations
 */
export const waitFor = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
