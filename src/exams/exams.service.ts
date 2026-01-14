import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from './entities/exam.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ExamStatus } from '../common/enums/exam-status.enum';

@Injectable()
export class ExamsService {
    constructor(
        @InjectRepository(Exam)
        private readonly examRepository: Repository<Exam>,
    ) { }

    async create(createExamDto: CreateExamDto): Promise<Exam> {
        const exam = this.examRepository.create(createExamDto);
        return this.examRepository.save(exam);
    }

    async findAll(): Promise<Exam[]> {
        return this.examRepository.find({
            relations: ['subject', 'class'],
        });
    }

    async findOne(id: string): Promise<Exam> {
        const exam = await this.examRepository.findOne({
            where: { id },
            relations: ['subject', 'class', 'results', 'results.student'],
        });
        if (!exam) {
            throw new NotFoundException(`Exam with ID ${id} not found`);
        }
        return exam;
    }

    async findByClass(classId: string): Promise<Exam[]> {
        return this.examRepository.find({
            where: { classId },
            relations: ['subject'],
        });
    }

    async findBySubject(subjectId: string): Promise<Exam[]> {
        return this.examRepository.find({
            where: { subjectId },
            relations: ['class'],
        });
    }

    async findUpcoming(): Promise<Exam[]> {
        return this.examRepository.find({
            where: { status: ExamStatus.SCHEDULED },
            relations: ['subject', 'class'],
            order: { examDate: 'ASC' },
        });
    }

    async update(id: string, updateExamDto: UpdateExamDto): Promise<Exam> {
        const exam = await this.findOne(id);
        Object.assign(exam, updateExamDto);
        return this.examRepository.save(exam);
    }

    async remove(id: string): Promise<void> {
        const exam = await this.findOne(id);
        await this.examRepository.remove(exam);
    }
}
