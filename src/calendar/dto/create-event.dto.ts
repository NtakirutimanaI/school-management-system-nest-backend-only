import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '../entities/school-event.entity';

export class CreateEventDto {
    @ApiProperty({ example: 'Term 1' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: '2024-01-01T08:00:00Z' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2024-03-31T17:00:00Z' })
    @IsDateString()
    endDate: string;

    @ApiProperty({ enum: EventType, example: EventType.TERM })
    @IsEnum(EventType)
    type: EventType;
}
