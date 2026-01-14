import {
    IsEmail,
    IsString,
    IsOptional,
    MinLength,
    IsPhoneNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class RegisterDto {
    @ApiProperty({
        example: 'john.doe@school.com',
        description: 'User email address',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'securePassword123',
        description: 'User password (minimum 6 characters)',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({
        example: 'John',
        description: 'User first name',
    })
    @IsString()
    firstName: string;

    @ApiProperty({
        example: 'Doe',
        description: 'User last name',
    })
    @IsString()
    lastName: string;

    @ApiPropertyOptional({
        example: '+250788123456',
        description: 'User phone number (optional)',
    })
    @IsPhoneNumber()
    @IsOptional()
    phoneNumber?: string;

    @ApiPropertyOptional({ enum: UserRole, description: 'User role (for testing only)' })
    @IsOptional()
    role?: UserRole;
}
