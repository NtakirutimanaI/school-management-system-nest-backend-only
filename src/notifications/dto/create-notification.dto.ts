import { IsString, IsUUID, IsOptional, IsEnum, IsObject } from 'class-validator';
import { NotificationType } from '../../common/enums/notification-type.enum';

export class CreateNotificationDto {
    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsEnum(NotificationType)
    @IsOptional()
    type?: NotificationType;

    @IsUUID()
    userId: string;

    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}
