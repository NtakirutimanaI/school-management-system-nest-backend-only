import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResourceRequestDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    item: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ default: 1 })
    @IsNumber()
    @Min(1)
    quantity: number;
}
