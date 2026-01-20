import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class StudentMarkDto {
    @ApiProperty()
    @IsUUID()
    studentId: string;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    marksObtained: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    remarks?: string;
}

export class RecordMarksDto {
    @ApiProperty()
    @IsUUID()
    assessmentId: string;

    @ApiProperty({ type: [StudentMarkDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StudentMarkDto)
    marks: StudentMarkDto[];
}
