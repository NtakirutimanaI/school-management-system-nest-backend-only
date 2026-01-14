import {
    IsString,
    IsEnum,
    IsDateString,
    IsOptional,
    IsNumber,
    IsUUID,
} from 'class-validator';
import { Gender } from '../../common/enums/gender.enum';

export class CreateTeacherDto {
    @IsString()
    employeeId: string;

    @IsEnum(Gender)
    gender: Gender;

    @IsDateString()
    dateOfBirth: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    qualification?: string;

    @IsString()
    @IsOptional()
    specialization?: string;

    @IsNumber()
    @IsOptional()
    salary?: number;

    @IsUUID()
    userId: string;
}
