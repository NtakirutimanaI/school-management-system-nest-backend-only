import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UsersQueryService } from './users.query.service';
import { MailService } from '../mail/mail.service';
import { createMockRepository, mockUser } from '../test/test-utils';
import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
    let service: UsersService;
    let repo: any;
    let queryService: any;
    let mailService: any;
    let queue: any;

    const mockQueue = {
        add: jest.fn(),
    };

    const mockMailService = {
        sendUserWelcome: jest.fn(),
    };

    const mockUsersQueryService = {
        findByEmail: jest.fn(),
        findByPhoneNumber: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: createMockRepository(),
                },
                {
                    provide: UsersQueryService,
                    useValue: mockUsersQueryService,
                },
                {
                    provide: MailService,
                    useValue: mockMailService,
                },
                {
                    provide: getQueueToken('users'),
                    useValue: mockQueue,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repo = module.get(getRepositoryToken(User));
        queryService = module.get(UsersQueryService);
        mailService = module.get(MailService);
        queue = module.get(getQueueToken('users'));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createUserDto = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
            role: 'student' as any,
        };

        it('should create a user successfully', async () => {
            queryService.findByEmail.mockResolvedValue(null);
            queryService.findByPhoneNumber.mockResolvedValue(null);
            repo.create.mockReturnValue(mockUser);
            repo.save.mockResolvedValue(mockUser);

            // Mock bcrypt hash
            jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed-password'));

            // Mock queue add
            queue.add.mockResolvedValue(undefined);

            const result = await service.create(createUserDto);

            expect(queryService.findByEmail).toHaveBeenCalledWith(createUserDto.email);
            expect(repo.create).toHaveBeenCalled();
            expect(repo.save).toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });

        it('should throw ConflictException if email exists', async () => {
            queryService.findByEmail.mockResolvedValue(mockUser);

            await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
        });

        it('should throw ConflictException if phone number exists', async () => {
            queryService.findByEmail.mockResolvedValue(null);
            queryService.findByPhoneNumber.mockResolvedValue(mockUser);

            await expect(service.create({ ...createUserDto, phoneNumber: '1234567890' })).rejects.toThrow(ConflictException);
        });
    });

    describe('update', () => {
        const updateUserDto = {
            firstName: 'Updated',
        };

        it('should update a user successfully', async () => {
            queryService.findOne.mockResolvedValue(mockUser);
            repo.save.mockResolvedValue({ ...mockUser, ...updateUserDto });

            const result = await service.update('user-id', updateUserDto);

            expect(queryService.findOne).toHaveBeenCalledWith('user-id');
            expect(repo.save).toHaveBeenCalled();
            expect(result.firstName).toEqual('Updated');
        });

        it('should hash password if provided', async () => {
            queryService.findOne.mockResolvedValue(mockUser);
            repo.save.mockResolvedValue(mockUser);
            const hashSpy = jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed-password'));

            await service.update('user-id', { password: 'new-password' });

            expect(hashSpy).toHaveBeenCalledWith('new-password', 10);
        });
    });

    describe('remove', () => {
        it('should remove a user', async () => {
            queryService.findOne.mockResolvedValue(mockUser);
            repo.remove.mockResolvedValue(mockUser);

            await service.remove('user-id');

            expect(queryService.findOne).toHaveBeenCalledWith('user-id');
            expect(repo.remove).toHaveBeenCalledWith(mockUser);
        });
    });

    describe('validatePassword', () => {
        it('should return true for valid password', async () => {
            // Create spy on bcrypt.compare
            const compareSpy = jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

            const result = await service.validatePassword(mockUser as any, 'password');

            expect(result).toBe(true);
            expect(compareSpy).toHaveBeenCalled();
        });

        it('should return false for invalid password', async () => {
            const compareSpy = jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

            const result = await service.validatePassword(mockUser as any, 'wrong-password');

            expect(result).toBe(false);
            expect(compareSpy).toHaveBeenCalled();
        });
    });

    describe('sanitizeUser', () => {
        it('should remove sensitive fields', () => {
            const user = { ...mockUser, password: 'hashed', resetPasswordToken: 'token' };

            const result = service.sanitizeUser(user as any);

            expect(result).not.toHaveProperty('password');
            expect(result).not.toHaveProperty('resetPasswordToken');
            expect(result).toHaveProperty('email');
        });
    });
});
