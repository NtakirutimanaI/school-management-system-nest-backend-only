import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DisciplineType, DisciplineSeverity, DisciplineStatus } from '../entities/discipline-record.entity';

export class CreateDisciplineRecordDto {
    @ApiProperty()
    @IsUUID()
    studentId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ enum: DisciplineType })
    @IsEnum(DisciplineType)
    type: DisciplineType;

    @ApiProperty({ enum: DisciplineSeverity })
    @IsEnum(DisciplineSeverity)
    severity: DisciplineSeverity;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    actionTaken?: string;

    @ApiProperty()
    @IsDateString()
    date: string;
}
