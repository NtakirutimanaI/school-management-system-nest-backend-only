import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceRequest, ResourceRequestStatus } from './entities/resource-request.entity';
import { CreateResourceRequestDto } from './dto/create-resource-request.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { TeachersService } from '../teachers/teachers.service';

@Injectable()
export class ResourceRequestsService {
    constructor(
        @InjectRepository(ResourceRequest)
        private repo: Repository<ResourceRequest>,
        @Inject(REQUEST) private request: Request,
        private teachersService: TeachersService,
    ) { }

    private getSchoolId(): string {
        return (this.request as any).schoolId;
    }

    async create(dto: CreateResourceRequestDto, userId: string) {
        const schoolId = this.getSchoolId();
        const teacher = await this.teachersService.findByUserId(userId);
        if (!teacher) throw new ForbiddenException('User is not a teacher');

        const req = this.repo.create({
            ...dto,
            teacherId: teacher.id,
            schoolId,
        });
        return this.repo.save(req);
    }

    async findAll() {
        const schoolId = this.getSchoolId();
        return this.repo.find({
            where: { schoolId },
            relations: ['teacher', 'teacher.user'],
            order: { createdAt: 'DESC' }
        });
    }

    async findByTeacher(userId: string) {
        const teacher = await this.teachersService.findByUserId(userId);
        if (!teacher) return [];
        return this.repo.find({
            where: { teacherId: teacher.id },
            order: { createdAt: 'DESC' }
        });
    }

    async updateStatus(id: string, status: ResourceRequestStatus, comment?: string) {
        const req = await this.repo.findOne({ where: { id } });
        if (!req) throw new NotFoundException('Request not found');
        req.status = status;
        if (comment) req.adminComment = comment;
        return this.repo.save(req);
    }
}
