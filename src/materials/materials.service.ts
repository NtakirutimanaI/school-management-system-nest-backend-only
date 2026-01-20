import { Injectable, NotFoundException, Inject, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { TeachersService } from '../teachers/teachers.service';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class MaterialsService {
    constructor(
        @InjectRepository(Material)
        private repo: Repository<Material>,
        @Inject(REQUEST) private request: Request,
        private teachersService: TeachersService,
    ) { }

    private getSchoolId(): string {
        return (this.request as any).schoolId;
    }

    async create(dto: CreateMaterialDto, userId: string) {
        const schoolId = this.getSchoolId();
        const teacher = await this.teachersService.findByUserId(userId);
        if (!teacher) throw new ForbiddenException('User is not a teacher');

        const material = this.repo.create({
            ...dto,
            teacherId: teacher.id,
            schoolId,
        });
        return this.repo.save(material);
    }

    async findAll(filters: { classId?: string; subjectId?: string; teacherId?: string }) {
        const schoolId = this.getSchoolId();
        const where: any = { schoolId };

        if (filters.classId) where.classId = filters.classId;
        if (filters.subjectId) where.subjectId = filters.subjectId;
        if (filters.teacherId) where.teacherId = filters.teacherId;

        return this.repo.find({ where, order: { createdAt: 'DESC' } });
    }

    async findByTeacher(userId: string) {
        const teacher = await this.teachersService.findByUserId(userId);
        if (!teacher) return [];
        return this.findAll({ teacherId: teacher.id });
    }
}
