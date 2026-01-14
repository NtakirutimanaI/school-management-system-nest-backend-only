import { IsUUID, IsDateString, IsArray, ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../common/enums/attendance-status.enum';

class StudentAttendanceDto {
    @IsUUID()
    studentId: string;

    @IsEnum(AttendanceStatus)
    @IsOptional()
    status?: AttendanceStatus;

    @IsOptional()
    remarks?: string;
}

export class BulkAttendanceDto {
    @IsUUID()
    classId: string;

    @IsDateString()
    date: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StudentAttendanceDto)
    attendances: StudentAttendanceDto[];
}
