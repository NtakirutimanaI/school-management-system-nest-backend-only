import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsEmail,
    IsOptional,
    IsEnum,
    IsBoolean,
    IsObject,
    IsUrl,
    MinLength,
    MaxLength,
    Matches,
} from 'class-validator';
import { SubscriptionPlan, SchoolSettings } from '../entities/school.entity';

export class CreateSchoolDto {
    @ApiProperty({ example: 'Greenwood High School' })
    @IsString()
    @MinLength(3)
    @MaxLength(200)
    name: string;

    @ApiProperty({ example: 'greenwood' })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @Matches(/^[a-z0-9-]+$/, {
        message: 'Subdomain must contain only lowercase letters, numbers, and hyphens',
    })
    subdomain: string;

    @ApiProperty({ example: 'contact@greenwood.edu' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ example: '+250788123456' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'Kigali, Rwanda' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ example: 'https://greenwood.edu' })
    @IsOptional()
    @IsUrl()
    website?: string;

    @ApiPropertyOptional({ example: 'A leading educational institution' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ enum: SubscriptionPlan, example: SubscriptionPlan.BASIC })
    @IsOptional()
    @IsEnum(SubscriptionPlan)
    subscriptionPlan?: SubscriptionPlan;

    @ApiPropertyOptional({
        example: {
            academicYearStart: 'September',
            academicYearEnd: 'June',
            timezone: 'Africa/Kigali',
            currency: 'RWF',
            language: 'en',
            dateFormat: 'DD/MM/YYYY',
            allowParentRegistration: true,
            requireEmailVerification: true,
            enableSMSNotifications: true,
            enableEmailNotifications: true,
            maxStudents: 1000,
            maxTeachers: 100,
            maxClasses: 50,
        },
    })
    @IsOptional()
    @IsObject()
    settings?: SchoolSettings;
}
