import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Assessment } from './entities/assessment.entity';
import { AssessmentResult } from './entities/assessment-result.entity';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { RecordMarksDto, StudentMarkDto } from './dto/record-marks.dto';
import { Student } from '../students/entities/student.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Class } from '../classes/entities/class.entity';
import * as XLSX from 'xlsx';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class AssessmentsService {
    constructor(
        @InjectRepository(Assessment)
        private assessmentRepo: Repository<Assessment>,
        @InjectRepository(AssessmentResult)
        private resultRepo: Repository<AssessmentResult>,
        @InjectRepository(Student)
        private studentRepo: Repository<Student>,
        @InjectRepository(Subject)
        private subjectRepo: Repository<Subject>,
        @InjectRepository(Class)
        private classRepo: Repository<Class>,
        @Inject(REQUEST) private request: Request,
    ) { }

    private getSchoolId(): string {
        return (this.request as any).schoolId;
    }

    async create(createDto: CreateAssessmentDto): Promise<Assessment> {
        const schoolId = this.getSchoolId();

        // Verify Subject and Class belong to school
        const subject = await this.subjectRepo.findOne({ where: { id: createDto.subjectId } });
        if (!subject) throw new NotFoundException('Subject not found');

        const classEntity = await this.classRepo.findOne({ where: { id: createDto.classId } });
        if (!classEntity) throw new NotFoundException('Class not found');

        const assessment = this.assessmentRepo.create({
            ...createDto,
            schoolId,
        });
        return this.assessmentRepo.save(assessment);
    }

    async findAll(filters: any, teacherId?: string): Promise<Assessment[]> {
        const schoolId = this.getSchoolId();
        const query = this.assessmentRepo.createQueryBuilder('assessment')
            .where('assessment.schoolId = :schoolId', { schoolId })
            .leftJoinAndSelect('assessment.subject', 'subject')
            .leftJoinAndSelect('assessment.class', 'class');

        if (filters.classId) query.andWhere('assessment.classId = :classId', { classId: filters.classId });
        if (filters.subjectId) query.andWhere('assessment.subjectId = :subjectId', { subjectId: filters.subjectId });
        if (filters.term) query.andWhere('assessment.term = :term', { term: filters.term });
        if (filters.academicYear) query.andWhere('assessment.academicYear = :academicYear', { academicYear: filters.academicYear });

        if (teacherId) {
            // Filter assessments where the subject is taught by this teacher
            // We need to join subject.teachers
            query.innerJoin('subject.teachers', 'teacher', 'teacher.id = :teacherId', { teacherId });
        }

        return query.getMany();
    }

    async findOne(id: string): Promise<Assessment> {
        const assessment = await this.assessmentRepo.findOne({
            where: { id, schoolId: this.getSchoolId() },
            relations: ['subject', 'class'],
        });
        if (!assessment) throw new NotFoundException('Assessment not found');
        return assessment;
    }

    async recordMarks(dto: RecordMarksDto): Promise<AssessmentResult[]> {
        const assessment = await this.findOne(dto.assessmentId);
        const schoolId = this.getSchoolId();

        const results: AssessmentResult[] = [];

        for (const markDto of dto.marks) {
            // Check if student exists and belongs to school
            // Optimization: Could fetch all students at once, but loop is safer for now
            // Logic: upsert
            let result = await this.resultRepo.findOne({
                where: { assessmentId: assessment.id, studentId: markDto.studentId },
            });

            if (result) {
                result.marksObtained = markDto.marksObtained;
                result.remarks = markDto.remarks || null;
            } else {
                result = this.resultRepo.create({
                    assessmentId: assessment.id,
                    studentId: markDto.studentId,
                    marksObtained: markDto.marksObtained,
                    remarks: markDto.remarks || null,
                    schoolId,
                });
            }
            results.push(await this.resultRepo.save(result));
        }
        return results;
    }

    async getMarksForAssessment(assessmentId: string): Promise<any> {
        const assessment = await this.findOne(assessmentId);

        // Get all students in the class
        const students = await this.studentRepo.find({
            where: { classId: assessment.classId },
            relations: ['user'],
            order: { user: { lastName: 'ASC' } }
        });

        // Get all existing results
        const results = await this.resultRepo.find({
            where: { assessmentId },
        });

        // Map results to students
        return students.map(student => {
            const result = results.find(r => r.studentId === student.id);
            return {
                student: {
                    id: student.id,
                    firstName: student.user.firstName,
                    lastName: student.user.lastName,
                    registrationNumber: 'REG-123', // Placeholder or add to entity
                },
                marksObtained: result ? result.marksObtained : null,
                remarks: result ? result.remarks : null,
                resultId: result ? result.id : null,
            };
        });
    }

    async uploadMarks(assessmentId: string, file: Express.Multer.File): Promise<any> {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet) as any[];

        // Expecting columns: StudentID, Marks, Remarks (Optional)
        const marksToRecord: StudentMarkDto[] = [];
        const errors: string[] = [];

        for (const row of data) {
            const studentId = row['StudentId'] || row['StudentID'] || row['student_id'];
            const marks = row['Marks'] || row['Score'];

            if (!studentId || marks === undefined) {
                errors.push(`Row missing StudentId or Marks: ${JSON.stringify(row)}`);
                continue;
            }

            marksToRecord.push({
                studentId: studentId.toString(),
                marksObtained: parseFloat(marks),
                remarks: row['Remarks'],
            });
        }

        if (marksToRecord.length > 0) {
            await this.recordMarks({ assessmentId, marks: marksToRecord });
        }

        return { success: true, count: marksToRecord.length, errors };
    }

    async updateStatus(id: string, status: 'DRAFT' | 'PUBLISHED') {
        const assessment = await this.findOne(id);
        assessment.status = status;
        return this.assessmentRepo.save(assessment);
    }

    async getStudentHistory(studentId: string, teacherId?: string) {
        const schoolId = this.getSchoolId();
        const query = this.resultRepo.createQueryBuilder('result')
            .leftJoinAndSelect('result.assessment', 'assessment')
            .leftJoinAndSelect('assessment.subject', 'subject')
            .leftJoinAndSelect('assessment.class', 'class')
            .where('result.studentId = :studentId', { studentId })
            .andWhere('assessment.schoolId = :schoolId', { schoolId })
            .orderBy('assessment.createdAt', 'DESC');

        if (teacherId) {
            query.innerJoin('subject.teachers', 'teacher', 'teacher.id = :teacherId', { teacherId });
        }

        return query.getMany();
    }
}
