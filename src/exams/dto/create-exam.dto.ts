import {
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { ExamType } from '../../common/enums/exam-status.enum';

export class CreateExamDto {
  @IsString()
  name: string;

  @IsEnum(ExamType)
  @IsOptional()
  type?: ExamType;

  @IsDateString()
  examDate: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  totalMarks?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  passingMarks?: number;

  @IsString()
  academicYear: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  subjectId: string;

  @IsUUID()
  classId: string;
}
