import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { AttendanceStatus } from '../common/enums/attendance-status.enum';
import { AttendanceQueryService } from './attendance.query.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance) private readonly repo: Repository<Attendance>,
    private readonly query: AttendanceQueryService,
  ) { }

  async create(dto: CreateAttendanceDto): Promise<Attendance> {
    const existing = await this.repo.findOne({
      where: { studentId: dto.studentId, classId: dto.classId, date: new Date(dto.date) },
    });
    if (existing) throw new ConflictException('Attendance already marked');
    return this.repo.save(this.repo.create(dto));
  }

  async bulkCreate(bulkDto: BulkAttendanceDto): Promise<Attendance[]> {
    const attendances = bulkDto.attendances.map((att) =>
      this.repo.create({
        studentId: att.studentId,
        classId: bulkDto.classId,
        date: new Date(bulkDto.date),
        status: att.status || AttendanceStatus.PRESENT,
        remarks: att.remarks,
      }),
    );
    return this.repo.save(attendances);
  }

  async update(id: string, dto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.query.findOne(id);
    Object.assign(attendance, dto);
    return this.repo.save(attendance);
  }

  async remove(id: string): Promise<void> {
    await this.repo.remove(await this.query.findOne(id));
  }
}
