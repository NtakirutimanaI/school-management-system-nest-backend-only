import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { AttendanceStatus } from '../common/enums/attendance-status.enum';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(Attendance)
        private readonly attendanceRepository: Repository<Attendance>,
    ) { }

    async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
        const existing = await this.attendanceRepository.findOne({
            where: {
                studentId: createAttendanceDto.studentId,
                classId: createAttendanceDto.classId,
                date: new Date(createAttendanceDto.date),
            },
        });
        if (existing) {
            throw new ConflictException('Attendance already marked for this student on this date');
        }
        const attendance = this.attendanceRepository.create(createAttendanceDto);
        return this.attendanceRepository.save(attendance);
    }

    async bulkCreate(bulkDto: BulkAttendanceDto): Promise<Attendance[]> {
        const attendances = bulkDto.attendances.map((att) =>
            this.attendanceRepository.create({
                studentId: att.studentId,
                classId: bulkDto.classId,
                date: new Date(bulkDto.date),
                status: att.status || AttendanceStatus.PRESENT,
                remarks: att.remarks,
            }),
        );
        return this.attendanceRepository.save(attendances);
    }

    async findAll(): Promise<Attendance[]> {
        return this.attendanceRepository.find({
            relations: ['student', 'student.user', 'class'],
        });
    }

    async findOne(id: string): Promise<Attendance> {
        const attendance = await this.attendanceRepository.findOne({
            where: { id },
            relations: ['student', 'student.user', 'class'],
        });
        if (!attendance) {
            throw new NotFoundException(`Attendance with ID ${id} not found`);
        }
        return attendance;
    }

    async findByStudent(studentId: string, startDate?: string, endDate?: string): Promise<Attendance[]> {
        const where: any = { studentId };
        if (startDate && endDate) {
            where.date = Between(new Date(startDate), new Date(endDate));
        }
        return this.attendanceRepository.find({ where, relations: ['class'] });
    }

    async findByClass(classId: string, date: string): Promise<Attendance[]> {
        return this.attendanceRepository.find({
            where: { classId, date: new Date(date) },
            relations: ['student', 'student.user'],
        });
    }

    async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
        const attendance = await this.findOne(id);
        Object.assign(attendance, updateAttendanceDto);
        return this.attendanceRepository.save(attendance);
    }

    async remove(id: string): Promise<void> {
        const attendance = await this.findOne(id);
        await this.attendanceRepository.remove(attendance);
    }

    async getStudentAttendanceStats(studentId: string, academicYear: string) {
        const stats = await this.attendanceRepository
            .createQueryBuilder('attendance')
            .select('attendance.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('attendance.student_id = :studentId', { studentId })
            .groupBy('attendance.status')
            .getRawMany();
        return stats;
    }
}
