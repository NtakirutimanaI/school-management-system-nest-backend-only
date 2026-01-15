
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationQueryService {
    constructor(@InjectRepository(Notification) private readonly repo: Repository<Notification>) { }

    async findAll() {
        return this.repo.find({ relations: ['user'], order: { createdAt: 'DESC' } });
    }

    async findByUser(userId: string) {
        return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    }

    async findUnread(userId: string) {
        return this.repo.find({ where: { userId, readAt: IsNull() }, order: { createdAt: 'DESC' } });
    }

    async findOne(id: string) {
        const n = await this.repo.findOne({ where: { id }, relations: ['user'] });
        if (!n) throw new NotFoundException(`Notification with ID ${id} not found`);
        return n;
    }

    async getUnreadCount(userId: string) {
        return this.repo.count({ where: { userId, readAt: IsNull() } });
    }
}
