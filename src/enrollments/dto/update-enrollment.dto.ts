import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateEnrollmentDto } from './create-enrollment.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateEnrollmentDto extends PartialType(
  OmitType(CreateEnrollmentDto, [
    'studentId',
    'classId',
    'academicYear',
  ] as const),
) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
