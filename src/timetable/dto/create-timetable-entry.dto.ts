import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek } from '../entities/timetable-entry.entity';

export class CreateTimetableEntryDto {
    @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY })
    @IsEnum(DayOfWeek)
    dayOfWeek: DayOfWeek;

    @ApiProperty({ example: '08:00', description: 'HH:MM format' })
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Time must be in HH:MM format' })
    startTime: string;

    @ApiProperty({ example: '09:00', description: 'HH:MM format' })
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Time must be in HH:MM format' })
    endTime: string;

    @ApiProperty()
    @IsUUID()
    classId: string;

    @ApiProperty()
    @IsUUID()
    subjectId: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    teacherId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    roomId?: string;
}
