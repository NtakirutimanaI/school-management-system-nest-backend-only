import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { NotificationStatus, NotificationType } from '../common/enums/notification-type.enum';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
        const notification = this.notificationRepository.create({
            ...createNotificationDto,
            status: NotificationStatus.SENT,
            sentAt: new Date(),
        });
        return this.notificationRepository.save(notification);
    }

    async broadcast(broadcastDto: BroadcastNotificationDto): Promise<Notification[]> {
        let userIds: string[] = broadcastDto.userIds || [];

        if (broadcastDto.targetRole) {
            const users = await this.userRepository.find({
                where: { role: broadcastDto.targetRole as UserRole },
                select: ['id'],
            });
            userIds = [...userIds, ...users.map((u) => u.id)];
        }

        const notifications = userIds.map((userId) =>
            this.notificationRepository.create({
                title: broadcastDto.title,
                message: broadcastDto.message,
                type: broadcastDto.type || NotificationType.IN_APP,
                userId,
                metadata: broadcastDto.metadata,
                status: NotificationStatus.SENT,
                sentAt: new Date(),
            }),
        );

        return this.notificationRepository.save(notifications);
    }

    async findAll(): Promise<Notification[]> {
        return this.notificationRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByUser(userId: string): Promise<Notification[]> {
        return this.notificationRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async findUnread(userId: string): Promise<Notification[]> {
        return this.notificationRepository.find({
            where: { userId, readAt: IsNull() },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Notification> {
        const notification = await this.notificationRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }
        return notification;
    }

    async markAsRead(id: string): Promise<Notification> {
        const notification = await this.findOne(id);
        notification.status = NotificationStatus.READ;
        notification.readAt = new Date();
        return this.notificationRepository.save(notification);
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepository.update(
            { userId, readAt: IsNull() },
            { status: NotificationStatus.READ, readAt: new Date() },
        );
    }

    async remove(id: string): Promise<void> {
        const notification = await this.findOne(id);
        await this.notificationRepository.remove(notification);
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.notificationRepository.count({
            where: { userId, readAt: IsNull() },
        });
    }
}
