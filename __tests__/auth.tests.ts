import { UnauthorizedException } from '@nestjs/common';
import { mockUser, createTestModule } from './setup';

describe('AuthService', () => {
    let service: any, usersService: any, query: any;
    beforeEach(async () => {
        const setup = await createTestModule();
        service = setup.service; usersService = setup.usersService; query = setup.queryService;
    });

    describe('register', () => {
        it('should register', async () => {
            usersService.create.mockResolvedValue(mockUser);
            const res = await service.register({ email: 't@e.com', password: 'p', firstName: 'F' });
            expect(res.user).toBeDefined();
        });
    });

    describe('login', () => {
        it('should return token', async () => {
            query.findByEmail.mockResolvedValue(mockUser);
            usersService.validatePassword.mockResolvedValue(true);
            const res = await service.login({ email: 't@e.com', password: 'p' });
            expect(res.accessToken).toBe('mock-token');
        });
        it('should fail if inactive', async () => {
            query.findByEmail.mockResolvedValue({ ...mockUser, isActive: false });
            usersService.validatePassword.mockResolvedValue(true);
            await expect(service.login({ email: 't@e.com', password: 'p' })).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('getProfile', () => {
        it('should return profile', async () => {
            query.findOne.mockResolvedValue(mockUser);
            const res = await service.getProfile('id');
            expect(res.email).toBe(mockUser.email);
        });
    });

    describe('resetPassword', () => {
        it('should reset', async () => {
            const exp = new Date(Date.now() + 3600000);
            query.findByResetToken.mockResolvedValue({ ...mockUser, resetPasswordExpires: exp });
            const res = await service.resetPassword('tok', 'new');
            expect(res.message).toBe('Password reset successfully');
        });
        it('should fail if expired', async () => {
            const exp = new Date(Date.now() - 3600000);
            query.findByResetToken.mockResolvedValue({ ...mockUser, resetPasswordExpires: exp });
            await expect(service.resetPassword('tok', 'new')).rejects.toThrow(UnauthorizedException);
        });
    });
});

