import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UsersQueryService } from '../users/users.query.service';
import { UserRole } from '../common/enums/user-role.enum';
import {
    createMockRepository,
    mockJwtService,
    mockUser,
    clearAllMocks,
} from '../test/test-utils';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: jest.Mocked<UsersService>;
    let queryService: jest.Mocked<UsersQueryService>;
    let jwtService: jest.Mocked<JwtService>;

    const mockUsersService = {
        create: jest.fn(),
        update: jest.fn(),
        sanitizeUser: jest.fn((user) => {
            const { password, resetPasswordToken, ...sanitized } = user;
            return sanitized;
        }),
        validatePassword: jest.fn(),
    };

    const mockQueryService = {
        findByEmail: jest.fn(),
        findOne: jest.fn(),
        findByResetToken: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: UsersQueryService, useValue: mockQueryService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get(UsersService);
        queryService = module.get(UsersQueryService);
        jwtService = module.get(JwtService);
    });

    afterEach(() => {
        clearAllMocks();
    });

    describe('register', () => {
        it('should successfully register a new user', async () => {
            const registerDto = {
                email: 'newuser@example.com',
                username: 'newuser',
                password: 'Password123!',
                firstName: 'New',
                lastName: 'User',
            };

            const createdUser = {
                id: 'new-user-id',
                ...registerDto,
                role: UserRole.STUDENT,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockUsersService.create.mockResolvedValue(createdUser);

            const result = await service.register(registerDto);

            expect(usersService.create).toHaveBeenCalledWith({
                ...registerDto,
                role: UserRole.STUDENT,
            });
            expect(usersService.sanitizeUser).toHaveBeenCalledWith(createdUser);
            expect(result).toHaveProperty('user');
            expect(result.user).not.toHaveProperty('password');
        });

        it('should register user with specified role', async () => {
            const registerDto = {
                email: 'teacher@example.com',
                username: 'teacher',
                password: 'Password123!',
                firstName: 'Teacher',
                lastName: 'User',
                role: UserRole.TEACHER,
            };

            const createdUser = {
                id: 'teacher-id',
                ...registerDto,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockUsersService.create.mockResolvedValue(createdUser);

            await service.register(registerDto);

            expect(usersService.create).toHaveBeenCalledWith(registerDto);
        });
    });

    describe('login', () => {
        it('should successfully login with valid credentials', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'Password123!',
            };

            const user = {
                id: 'user-id',
                email: loginDto.email,
                password: 'hashed-password',
                role: UserRole.STUDENT,
                isActive: true,
                username: 'testuser',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockQueryService.findByEmail.mockResolvedValue(user);
            mockUsersService.validatePassword.mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue('mock-jwt-token');

            const result = await service.login(loginDto);

            expect(queryService.findByEmail).toHaveBeenCalledWith(loginDto.email);
            expect(usersService.validatePassword).toHaveBeenCalledWith(
                user,
                loginDto.password,
            );
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: user.id,
                email: user.email,
                role: user.role,
            });
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('accessToken');
            expect(result.accessToken).toBe('mock-jwt-token');
        });

        it('should throw UnauthorizedException for invalid email', async () => {
            const loginDto = {
                email: 'nonexistent@example.com',
                password: 'Password123!',
            };

            mockQueryService.findByEmail.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(service.login(loginDto)).rejects.toThrow(
                'Invalid credentials',
            );
        });

        it('should throw UnauthorizedException for invalid password', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'WrongPassword',
            };

            const user = {
                id: 'user-id',
                email: loginDto.email,
                password: 'hashed-password',
                role: UserRole.STUDENT,
                isActive: true,
                username: 'testuser',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockQueryService.findByEmail.mockResolvedValue(user);
            mockUsersService.validatePassword.mockResolvedValue(false);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException for inactive account', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'Password123!',
            };

            const user = {
                id: 'user-id',
                email: loginDto.email,
                password: 'hashed-password',
                role: UserRole.STUDENT,
                isActive: false,
                username: 'testuser',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockQueryService.findByEmail.mockResolvedValue(user);
            mockUsersService.validatePassword.mockResolvedValue(true);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(service.login(loginDto)).rejects.toThrow(
                'Account deactivated',
            );
        });
    });

    describe('getProfile', () => {
        it('should return sanitized user profile', async () => {
            const userId = 'user-id';
            const user = {
                id: userId,
                email: 'test@example.com',
                password: 'hashed-password',
                role: UserRole.STUDENT,
                isActive: true,
                username: 'testuser',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockQueryService.findOne.mockResolvedValue(user);

            const result = await service.getProfile(userId);

            expect(queryService.findOne).toHaveBeenCalledWith(userId);
            expect(usersService.sanitizeUser).toHaveBeenCalledWith(user);
            expect(result).not.toHaveProperty('password');
        });
    });

    describe('resetPassword', () => {
        it('should successfully reset password with valid token', async () => {
            const token = 'valid-reset-token';
            const newPassword = 'NewPassword123!';

            const user = {
                id: 'user-id',
                email: 'test@example.com',
                resetPasswordToken: 'hashed-token',
                resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour from now
                role: UserRole.STUDENT,
                isActive: true,
                username: 'testuser',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockQueryService.findByResetToken.mockResolvedValue(user);
            mockUsersService.update.mockResolvedValue(user);

            const result = await service.resetPassword(token, newPassword);

            expect(queryService.findByResetToken).toHaveBeenCalled();
            expect(usersService.update).toHaveBeenCalledWith(user.id, {
                password: newPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            });
            expect(result).toEqual({ message: 'Password reset successfully' });
        });

        it('should throw UnauthorizedException for invalid token', async () => {
            const token = 'invalid-token';
            const newPassword = 'NewPassword123!';

            mockQueryService.findByResetToken.mockResolvedValue(null);

            await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
                'Invalid or expired token',
            );
        });

        it('should throw UnauthorizedException for expired token', async () => {
            const token = 'expired-token';
            const newPassword = 'NewPassword123!';

            const user = {
                id: 'user-id',
                email: 'test@example.com',
                resetPasswordToken: 'hashed-token',
                resetPasswordExpires: new Date(Date.now() - 3600000), // 1 hour ago
                role: UserRole.STUDENT,
                isActive: true,
                username: 'testuser',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockQueryService.findByResetToken.mockResolvedValue(user);

            await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('generateToken', () => {
        it('should generate JWT token with correct payload', () => {
            const userId = 'user-id';
            const email = 'test@example.com';
            const role = UserRole.STUDENT;

            mockJwtService.sign.mockReturnValue('generated-token');

            const token = service['generateToken'](userId, email, role);

            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: userId,
                email,
                role,
            });
            expect(token).toBe('generated-token');
        });
    });
});
