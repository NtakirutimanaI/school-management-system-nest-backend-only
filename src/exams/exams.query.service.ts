
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from './entities/exam.entity';
import { ExamStatus } from '../common/enums/exam-status.enum';

@Injectable()
export class ExamsQueryService {
    constructor(@InjectRepository(Exam) private readonly repo: Repository<Exam>) { }

    async findAll() { return this.repo.find({ relations: ['subject', 'class'] }); }
    async findOne(id: string) {
        const e = await this.repo.findOne({ where: { id }, relations: ['subject', 'class', 'results', 'results.student'] });
        if (!e) throw new NotFoundException(`Exam ${id} not found`);
        return e;
    }
    async findByClass(classId: string) { return this.repo.find({ where: { classId }, relations: ['subject'] }); }
    async findBySubject(subjectId: string) { return this.repo.find({ where: { subjectId }, relations: ['class'] }); }
    async findUpcoming() { return this.repo.find({ where: { status: ExamStatus.SCHEDULED }, relations: ['subject', 'class'], order: { examDate: 'ASC' } }); }
}
