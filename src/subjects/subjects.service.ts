import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
    constructor(
        @InjectRepository(Subject)
        private readonly subjectRepository: Repository<Subject>,
    ) { }

    async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
        const existing = await this.subjectRepository.findOne({
            where: { code: createSubjectDto.code },
        });
        if (existing) {
            throw new ConflictException(`Subject with code ${createSubjectDto.code} already exists`);
        }
        const subject = this.subjectRepository.create(createSubjectDto);
        return this.subjectRepository.save(subject);
    }

    async findAll(): Promise<Subject[]> {
        return this.subjectRepository.find({
            relations: ['teachers', 'teachers.user'],
        });
    }

    async findOne(id: string): Promise<Subject> {
        const subject = await this.subjectRepository.findOne({
            where: { id },
            relations: ['teachers', 'teachers.user'],
        });
        if (!subject) {
            throw new NotFoundException(`Subject with ID ${id} not found`);
        }
        return subject;
    }

    async update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<Subject> {
        const subject = await this.findOne(id);
        Object.assign(subject, updateSubjectDto);
        return this.subjectRepository.save(subject);
    }

    async remove(id: string): Promise<void> {
        const subject = await this.findOne(id);
        await this.subjectRepository.remove(subject);
    }
}
