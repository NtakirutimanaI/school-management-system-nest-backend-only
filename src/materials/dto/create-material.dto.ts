import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaterialType } from '../entities/material.entity';

export class CreateMaterialDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ enum: MaterialType })
    @IsEnum(MaterialType)
    type: MaterialType;

    // File URL is handled by controller upload logic, so it's not in the input DTO directly usually, 
    // but we can leave it as optional for manual entry or populate it.
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    fileUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    subjectId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    classId?: string;
}
