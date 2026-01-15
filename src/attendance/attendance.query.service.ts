
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance } from './entities/attendance.entity';

@Injectable()
export class AttendanceQueryService {
    constructor(@InjectRepository(Attendance) private readonly repo: Repository<Attendance>) { }

    async findAll() {
        return this.repo.find({ relations: ['student', 'student.user', 'class'] });
    }

    async findOne(id: string) {
        const a = await this.repo.findOne({ where: { id }, relations: ['student', 'student.user', 'class'] });
        if (!a) throw new NotFoundException(`Attendance with ID ${id} not found`);
        return a;
    }

    async findByStudent(studentId: string, start?: string, end?: string) {
        const where: any = { studentId };
        if (start && end) where.date = Between(new Date(start), new Date(end));
        return this.repo.find({ where, relations: ['class'] });
    }

    async findByClass(classId: string, date: string) {
        return this.repo.find({ where: { classId, date: new Date(date) }, relations: ['student', 'student.user'] });
    }

    async getStudentStats(studentId: string) {
        return this.repo.createQueryBuilder('attendance')
            .select('attendance.status', 'status').addSelect('COUNT(*)', 'count')
            .where('attendance.student_id = :studentId', { studentId })
            .groupBy('attendance.status').getRawMany();
    }
}
