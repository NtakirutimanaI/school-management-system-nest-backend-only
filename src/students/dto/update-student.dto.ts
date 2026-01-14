import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateStudentDto extends PartialType(
    OmitType(CreateStudentDto, ['userId'] as const),
) {
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
