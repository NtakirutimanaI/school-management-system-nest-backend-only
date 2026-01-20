import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisciplineRecord } from './entities/discipline-record.entity';
import { CreateDisciplineRecordDto } from './dto/create-discipline-record.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class DisciplineService {
    constructor(
        @InjectRepository(DisciplineRecord)
        private repo: Repository<DisciplineRecord>,
        @Inject(REQUEST) private request: Request,
    ) { }

    private getSchoolId(): string {
        return (this.request as any).schoolId;
    }

    async create(dto: CreateDisciplineRecordDto) {
        const schoolId = this.getSchoolId();
        const record = this.repo.create({ ...dto, schoolId });
        return this.repo.save(record);
    }

    async findAll() {
        const schoolId = this.getSchoolId();
        return this.repo.find({ where: { schoolId }, relations: ['student', 'student.user'], order: { date: 'DESC' } });
    }

    async findByStudent(studentId: string) {
        const schoolId = this.getSchoolId();
        return this.repo.find({ where: { studentId, schoolId }, order: { date: 'DESC' } });
    }

    async update(id: string, dto: any) {
        const schoolId = this.getSchoolId();
        const record = await this.repo.findOne({ where: { id, schoolId } });
        if (!record) throw new NotFoundException('Record not found');
        Object.assign(record, dto);
        return this.repo.save(record);
    }

    async remove(id: string) {
        const schoolId = this.getSchoolId();
        const record = await this.repo.findOne({ where: { id, schoolId } });
        if (!record) throw new NotFoundException('Record not found');
        return this.repo.remove(record);
    }
}
