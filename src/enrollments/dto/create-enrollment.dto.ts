import { IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';

export class CreateEnrollmentDto {
    @IsUUID()
    studentId: string;

    @IsUUID()
    classId: string;

    @IsString()
    academicYear: string;

    @IsDateString()
    @IsOptional()
    enrollmentDate?: string;

    @IsString()
    @IsOptional()
    remarks?: string;
}
