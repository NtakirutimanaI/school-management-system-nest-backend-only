import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    author: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    isbn?: string;

    @ApiProperty({ default: 1 })
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    category?: string;
}
