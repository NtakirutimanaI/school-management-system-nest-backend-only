import {
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { AttendanceStatus } from '../../common/enums/attendance-status.enum';

export class CreateAttendanceDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  classId: string;

  @IsDateString()
  date: string;

  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  checkInTime?: string;

  @IsString()
  @IsOptional()
  checkOutTime?: string;
}
