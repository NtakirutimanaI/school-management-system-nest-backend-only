import {
    IsEmail,
    IsString,
    IsEnum,
    IsOptional,
    MinLength,
    IsPhoneNumber,
} from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    @IsPhoneNumber()
    @IsOptional()
    phoneNumber?: string;
}
