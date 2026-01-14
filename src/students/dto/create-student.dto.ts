import {
    IsString,
    IsEnum,
    IsDateString,
    IsOptional,
    IsEmail,
    IsPhoneNumber,
    IsUUID,
} from 'class-validator';
import { Gender } from '../../common/enums/gender.enum';

export class CreateStudentDto {
    @IsString()
    admissionNumber: string;

    @IsEnum(Gender)
    gender: Gender;

    @IsDateString()
    dateOfBirth: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    parentName?: string;

    @IsPhoneNumber()
    @IsOptional()
    parentPhone?: string;

    @IsEmail()
    @IsOptional()
    parentEmail?: string;

    @IsPhoneNumber()
    @IsOptional()
    emergencyContact?: string;

    @IsString()
    @IsOptional()
    bloodGroup?: string;

    @IsUUID()
    userId: string;

    @IsUUID()
    @IsOptional()
    classId?: string;
}
