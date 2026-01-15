import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersQueryService {
    constructor(@InjectRepository(User) private repo: Repository<User>) { }

    async findAll() { return this.repo.find({ select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'] }); }
    async findOne(id: string) {
        const user = await this.repo.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }
    async findByEmail(email: string) { return this.repo.findOne({ where: { email } }); }
    async findByPhoneNumber(phone: string) { return this.repo.findOne({ where: { phoneNumber: phone } }); }
    async findByResetToken(token: string) { return this.repo.findOne({ where: { resetPasswordToken: token } }); }
}
