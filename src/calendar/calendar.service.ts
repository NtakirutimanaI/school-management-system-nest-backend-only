import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolEvent } from './entities/school-event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class CalendarService {
    constructor(
        @InjectRepository(SchoolEvent)
        private eventRepo: Repository<SchoolEvent>,
        @Inject(REQUEST) private request: Request,
    ) { }

    private getSchoolId(): string {
        return (this.request as any).schoolId;
    }

    async create(dto: CreateEventDto) {
        const schoolId = this.getSchoolId();
        const event = this.eventRepo.create({ ...dto, schoolId });
        return this.eventRepo.save(event);
    }

    async findAll() {
        const schoolId = this.getSchoolId();
        return this.eventRepo.find({
            where: { schoolId },
            order: { startDate: 'ASC' },
        });
    }

    async update(id: string, dto: Partial<CreateEventDto>) {
        const schoolId = this.getSchoolId();
        const event = await this.eventRepo.findOne({ where: { id, schoolId } });
        if (!event) throw new NotFoundException('Event not found');
        Object.assign(event, dto);
        return this.eventRepo.save(event);
    }

    async remove(id: string) {
        const schoolId = this.getSchoolId();
        const event = await this.eventRepo.findOne({ where: { id, schoolId } });
        if (!event) throw new NotFoundException('Event not found');
        return this.eventRepo.remove(event);
    }
}
