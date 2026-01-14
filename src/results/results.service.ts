import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from './entities/result.entity';
import { Exam } from '../exams/entities/exam.entity';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { BulkResultDto } from './dto/bulk-result.dto';

@Injectable()
export class ResultsService {
    constructor(
        @InjectRepository(Result)
        private readonly resultRepository: Repository<Result>,
        @InjectRepository(Exam)
        private readonly examRepository: Repository<Exam>,
    ) { }

    async create(createResultDto: CreateResultDto): Promise<Result> {
        const existing = await this.resultRepository.findOne({
            where: { studentId: createResultDto.studentId, examId: createResultDto.examId },
        });
        if (existing) {
            throw new ConflictException('Result already exists for this student and exam');
        }

        const exam = await this.examRepository.findOne({ where: { id: createResultDto.examId } });
        if (!exam) {
            throw new NotFoundException('Exam not found');
        }

        const result = this.resultRepository.create({
            ...createResultDto,
            ...this.calculateGradeAndStatus(createResultDto.marksObtained, exam.totalMarks, exam.passingMarks),
        });
        return this.resultRepository.save(result);
    }

    async bulkCreate(bulkDto: BulkResultDto): Promise<Result[]> {
        const exam = await this.examRepository.findOne({ where: { id: bulkDto.examId } });
        if (!exam) {
            throw new NotFoundException('Exam not found');
        }

        const results = bulkDto.results.map((r) =>
            this.resultRepository.create({
                studentId: r.studentId,
                examId: bulkDto.examId,
                marksObtained: r.marksObtained,
                remarks: r.remarks,
                ...this.calculateGradeAndStatus(r.marksObtained, exam.totalMarks, exam.passingMarks),
            }),
        );
        return this.resultRepository.save(results);
    }

    private calculateGradeAndStatus(marks: number, total: number, passing: number) {
        const percentage = (marks / total) * 100;
        const isPassed = marks >= passing;
        let grade = 'F';
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';
        else if (percentage >= 40) grade = 'E';
        return { percentage, isPassed, grade };
    }

    async findAll(): Promise<Result[]> {
        return this.resultRepository.find({ relations: ['student', 'student.user', 'exam', 'exam.subject'] });
    }

    async findOne(id: string): Promise<Result> {
        const result = await this.resultRepository.findOne({
            where: { id },
            relations: ['student', 'student.user', 'exam', 'exam.subject'],
        });
        if (!result) {
            throw new NotFoundException(`Result with ID ${id} not found`);
        }
        return result;
    }

    async findByStudent(studentId: string): Promise<Result[]> {
        return this.resultRepository.find({
            where: { studentId },
            relations: ['exam', 'exam.subject'],
        });
    }

    async findByExam(examId: string): Promise<Result[]> {
        return this.resultRepository.find({
            where: { examId },
            relations: ['student', 'student.user'],
        });
    }

    async update(id: string, updateResultDto: UpdateResultDto): Promise<Result> {
        const result = await this.findOne(id);
        Object.assign(result, updateResultDto);
        return this.resultRepository.save(result);
    }

    async remove(id: string): Promise<void> {
        const result = await this.findOne(id);
        await this.resultRepository.remove(result);
    }
}
