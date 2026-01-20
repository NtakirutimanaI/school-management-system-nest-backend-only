import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement, AnnouncementTarget } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AnnouncementsService {
    constructor(
        @InjectRepository(Announcement)
        private repo: Repository<Announcement>,
        @Inject(REQUEST) private request: Request,
    ) { }

    private getSchoolId(): string {
        return (this.request as any).schoolId; // via TenantMiddleware
    }

    async create(dto: CreateAnnouncementDto, authorId: string) {
        const schoolId = this.getSchoolId();
        const ann = this.repo.create({ ...dto, schoolId, authorId });
        return this.repo.save(ann);
    }

    async findAll(userRole: UserRole) {
        const schoolId = this.getSchoolId();
        const query = this.repo.createQueryBuilder('announcement')
            .where('announcement.schoolId = :schoolId', { schoolId })
            .leftJoinAndSelect('announcement.author', 'author')
            .orderBy('announcement.createdAt', 'DESC');

        // If generic user (student/teacher/parent), filter targets
        if ([UserRole.STUDENT, UserRole.TEACHER, UserRole.PARENT].includes(userRole)) {
            const targets = [AnnouncementTarget.ALL];
            if (userRole === UserRole.STUDENT) targets.push(AnnouncementTarget.STUDENTS);
            if (userRole === UserRole.TEACHER) targets.push(AnnouncementTarget.TEACHERS);
            if (userRole === UserRole.PARENT) targets.push(AnnouncementTarget.PARENTS);

            query.andWhere('announcement.target IN (:...targets)', { targets });
        }
        // Admins see everything

        return query.getMany();
    }
}
