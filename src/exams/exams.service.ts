import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from './entities/exam.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ExamsQueryService } from './exams.query.service';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam) private readonly repo: Repository<Exam>,
    private readonly query: ExamsQueryService,
  ) { }

  async create(dto: CreateExamDto): Promise<Exam> { return this.repo.save(this.repo.create(dto)); }
  async update(id: string, dto: UpdateExamDto) {
    const exam = await this.query.findOne(id);
    return this.repo.save(Object.assign(exam, dto));
  }
  async remove(id: string) { await this.repo.remove(await this.query.findOne(id)); }
}
