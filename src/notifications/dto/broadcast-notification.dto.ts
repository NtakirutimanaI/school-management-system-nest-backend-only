import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';
import { NotificationType } from '../../common/enums/notification-type.enum';
import { UserRole } from '../../common/enums/user-role.enum';

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

  @IsEnum(UserRole)
  @IsOptional()
  targetRole?: UserRole;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
