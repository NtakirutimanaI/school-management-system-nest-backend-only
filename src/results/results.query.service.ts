
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from './entities/result.entity';

@Injectable()
export class ResultsQueryService {
    constructor(@InjectRepository(Result) private readonly repo: Repository<Result>) { }

    async findAll() {
        return this.repo.find({ relations: ['student', 'student.user', 'exam', 'exam.subject'] });
    }

    async findOne(id: string) {
        const r = await this.repo.findOne({ where: { id }, relations: ['student', 'student.user', 'exam', 'exam.subject'] });
        if (!r) throw new NotFoundException(`Result ${id} not found`);
        return r;
    }

    async findByStudent(studentId: string) {
        return this.repo.find({ where: { studentId }, relations: ['exam', 'exam.subject'] });
    }

    async findByExam(examId: string) {
        return this.repo.find({ where: { examId }, relations: ['student', 'student.user'] });
    }
}
