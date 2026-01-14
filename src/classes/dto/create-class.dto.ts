import {
    IsString,
    IsNumber,
    IsOptional,
    IsUUID,
    Min,
    Max,
} from 'class-validator';

export class CreateClassDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    section?: string;

    @IsNumber()
    @Min(1)
    @Max(12)
    gradeLevel: number;

    @IsString()
    academicYear: string;

    @IsString()
    @IsOptional()
    room?: string;

    @IsNumber()
    @IsOptional()
    capacity?: number;

    @IsUUID()
    @IsOptional()
    classTeacherId?: string;
}
