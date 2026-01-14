import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        example: 'admin@school.com',
        description: 'User email address',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'admin123',
        description: 'User password (minimum 6 characters)',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    password: string;
}
