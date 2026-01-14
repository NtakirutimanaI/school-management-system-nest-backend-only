import { PartialType } from '@nestjs/mapped-types';
import { CreateFeeDto } from './create-fee.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateFeeDto extends PartialType(CreateFeeDto) {
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
