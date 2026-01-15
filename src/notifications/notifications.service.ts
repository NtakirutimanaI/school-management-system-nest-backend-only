
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { NotificationStatus, NotificationType } from '../common/enums/notification-type.enum';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationQueryService } from './notifications.query.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly repo: Repository<Notification>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly gateway: NotificationsGateway,
    private readonly query: NotificationQueryService,
  ) { }

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const n = this.repo.create({ ...dto, status: NotificationStatus.SENT, sentAt: new Date() });
    const saved = await this.repo.save(n);
    this.gateway.sendNotification(dto.userId, saved);
    return saved;
  }

  async broadcast(dto: BroadcastNotificationDto): Promise<Notification[]> {
    let ids = dto.userIds || [];
    if (dto.targetRole) {
      const users = await this.userRepo.find({ where: { role: dto.targetRole }, select: ['id'] });
      ids = [...new Set([...ids, ...users.map(u => u.id)])];
    }
    const ns = ids.map(userId => this.repo.create({
      title: dto.title, message: dto.message, type: dto.type || NotificationType.IN_APP,
      userId, status: NotificationStatus.SENT, sentAt: new Date(),
    }));
    const saved = await this.repo.save(ns);
    saved.forEach(n => this.gateway.sendNotification(n.userId, n));
    return saved;
  }

  async markAsRead(id: string): Promise<Notification> {
    const n = await this.query.findOne(id);
    n.status = NotificationStatus.READ;
    n.readAt = new Date();
    return this.repo.save(n);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update({ userId, readAt: IsNull() }, { status: NotificationStatus.READ, readAt: new Date() });
  }

  async remove(id: string): Promise<void> {
    await this.repo.remove(await this.query.findOne(id));
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await this.repo.delete({ createdAt: LessThan(thirtyDaysAgo) });
  }
}
