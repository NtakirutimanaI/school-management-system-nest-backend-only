import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateResultDto } from './create-result.dto';

export class UpdateResultDto extends PartialType(
    OmitType(CreateResultDto, ['studentId', 'examId'] as const),
) { }
