import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { UsersQueryService } from '../src/users/users.query.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../src/common/enums/user-role.enum';
import { User } from '../src/users/entities/user.entity';

export const mockUser: User = {
    id: 'user-id', email: 'test@example.com', password: 'hashed-password',
    firstName: 'Test', lastName: 'User', role: UserRole.STUDENT,
    phoneNumber: '1234567890', isActive: true, isVerified: true,
} as any;

export const createTestModule = async () => {
    const usersService = {
        create: jest.fn(), validatePassword: jest.fn(), update: jest.fn(),
        sanitizeUser: jest.fn().mockImplementation(u => { const { password, ...r } = u; return r; }),
    };
    const queryService = {
        findByEmail: jest.fn(), findOne: jest.fn(), findByResetToken: jest.fn(),
    };
    const jwtService = { sign: jest.fn().mockReturnValue('mock-token') };
    const module = await Test.createTestingModule({
        providers: [
            AuthService,
            { provide: UsersService, useValue: usersService },
            { provide: UsersQueryService, useValue: queryService },
            { provide: JwtService, useValue: jwtService },
        ],
    }).compile();
    return { module, service: module.get<AuthService>(AuthService), usersService, queryService, jwtService };
};
