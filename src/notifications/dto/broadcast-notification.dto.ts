import { IsString, IsArray, IsOptional, IsEnum, IsObject } from 'class-validator';
import { NotificationType } from '../../common/enums/notification-type.enum';

export class BroadcastNotificationDto {
    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsEnum(NotificationType)
    @IsOptional()
    type?: NotificationType;

    @IsArray()
    @IsOptional()
    userIds?: string[];

    @IsString()
    @IsOptional()
    targetRole?: string;

    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}
