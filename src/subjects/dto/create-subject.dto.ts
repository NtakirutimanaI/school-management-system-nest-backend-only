import {
    IsString,
    IsNumber,
    IsOptional,
    IsBoolean,
    Min,
} from 'class-validator';

export class CreateSubjectDto {
    @IsString()
    name: string;

    @IsString()
    code: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(1)
    @IsOptional()
    creditHours?: number;

    @IsBoolean()
    @IsOptional()
    isMandatory?: boolean;
}
