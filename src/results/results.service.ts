import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from './entities/result.entity';
import { Exam } from '../exams/entities/exam.entity';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { BulkResultDto } from './dto/bulk-result.dto';
import { calculateGrade } from './results.calculator';
import { ResultsQueryService } from './results.query.service';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(Result) private readonly repo: Repository<Result>,
    @InjectRepository(Exam) private readonly examRepo: Repository<Exam>,
    private readonly query: ResultsQueryService,
  ) { }

  async create(dto: CreateResultDto): Promise<Result> {
    const ex = await this.repo.findOne({ where: { studentId: dto.studentId, examId: dto.examId } });
    if (ex) throw new ConflictException('Result exists');
    const exam = await this.examRepo.findOne({ where: { id: dto.examId } });
    if (!exam) throw new NotFoundException('Exam not found');
    return this.repo.save(this.repo.create({ ...dto, ...calculateGrade(dto.marksObtained, exam.totalMarks, exam.passingMarks) }));
  }

  async bulkCreate(dto: BulkResultDto): Promise<Result[]> {
    const exam = await this.examRepo.findOne({ where: { id: dto.examId } });
    if (!exam) throw new NotFoundException('Exam not found');
    const rs = dto.results.map(r => this.repo.create({
      ...r, examId: dto.examId, ...calculateGrade(r.marksObtained, exam.totalMarks, exam.passingMarks)
    }));
    return this.repo.save(rs);
  }

  async update(id: string, dto: UpdateResultDto) {
    const r = await this.query.findOne(id);
    return this.repo.save(Object.assign(r, dto));
  }

  async remove(id: string) { await this.repo.remove(await this.query.findOne(id)); }
}
