import { PartialType } from '@nestjs/swagger';
import { CreateSchoolDto } from './create-school.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { SubscriptionStatus } from '../entities/school.entity';

export class UpdateSchoolDto extends PartialType(CreateSchoolDto) {
    @ApiPropertyOptional({ enum: SubscriptionStatus })
    @IsOptional()
    @IsEnum(SubscriptionStatus)
    subscriptionStatus?: SubscriptionStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
