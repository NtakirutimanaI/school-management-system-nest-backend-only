import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AnnouncementTarget } from '../entities/announcement.entity';

export class CreateAnnouncementDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ enum: AnnouncementTarget, default: AnnouncementTarget.ALL })
    @IsEnum(AnnouncementTarget)
    @IsOptional()
    target?: AnnouncementTarget;
}
