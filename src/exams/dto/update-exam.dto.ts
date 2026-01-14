import { PartialType } from '@nestjs/mapped-types';
import { CreateExamDto } from './create-exam.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ExamStatus } from '../../common/enums/exam-status.enum';

export class UpdateExamDto extends PartialType(CreateExamDto) {
    @IsEnum(ExamStatus)
    @IsOptional()
    status?: ExamStatus;
}
