import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTeacherDto } from './create-teacher.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTeacherDto extends PartialType(
  OmitType(CreateTeacherDto, ['userId'] as const),
) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
