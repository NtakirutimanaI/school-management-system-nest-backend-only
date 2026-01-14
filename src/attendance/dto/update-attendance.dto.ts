import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateAttendanceDto } from './create-attendance.dto';

export class UpdateAttendanceDto extends PartialType(
    OmitType(CreateAttendanceDto, ['studentId', 'classId', 'date'] as const),
) { }
