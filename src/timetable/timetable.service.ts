import { Injectable, NotFoundException, Inject, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimetableEntry } from './entities/timetable-entry.entity';
import { CreateTimetableEntryDto } from './dto/create-timetable-entry.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class TimetableService {
    constructor(
        @InjectRepository(TimetableEntry)
        private repo: Repository<TimetableEntry>,
        @Inject(REQUEST) private request: Request,
    ) { }

    private getSchoolId(): string {
        return (this.request as any).schoolId;
    }

    async create(dto: CreateTimetableEntryDto) {
        const schoolId = this.getSchoolId();
        // Check for collision? Advanced feature. Maybe skip for now to keep scope manageable.
        // Ideally we check if teacher is busy or room is busy or class is busy.
        // I'll add a simple check for 'Class is busy'.
        const existing = await this.repo.findOne({
            where: {
                schoolId,
                dayOfWeek: dto.dayOfWeek,
                startTime: dto.startTime, // exact match check (simplified)
                classId: dto.classId
            }
        });

        if (existing) {
            // Warn but allow? Or block. Block is safer.
            // Only if time is exact. Better overlap logic needed but for now this prevents duplicates.
            throw new ConflictException('Class already has a session at this time');
        }

        const entry = this.repo.create({ ...dto, schoolId });
        return this.repo.save(entry);
    }

    async findByClass(classId: string) {
        const schoolId = this.getSchoolId();
        return this.repo.find({
            where: { classId, schoolId },
            relations: ['subject', 'teacher'],
            order: { dayOfWeek: 'ASC', startTime: 'ASC' }
        });
    }

    async findByTeacher(teacherId: string) {
        const schoolId = this.getSchoolId();
        return this.repo.find({
            where: { teacherId, schoolId },
            relations: ['subject', 'class'],
            order: { dayOfWeek: 'ASC', startTime: 'ASC' }
        });
    }

    async remove(id: string) {
        const schoolId = this.getSchoolId();
        const entry = await this.repo.findOne({ where: { id, schoolId } });
        if (!entry) throw new NotFoundException('Entry not found');
        return this.repo.remove(entry);
    }
}
