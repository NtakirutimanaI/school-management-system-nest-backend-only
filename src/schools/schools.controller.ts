import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { SubscriptionStatus } from './entities/school.entity';

@ApiTags('Schools')
@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SchoolsController {
    constructor(private readonly schoolsService: SchoolsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create a new school (Super Admin only)' })
    create(@Body() createSchoolDto: CreateSchoolDto) {
        return this.schoolsService.create(createSchoolDto);
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get all schools (Super Admin only)' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiQuery({ name: 'subscriptionStatus', required: false, enum: SubscriptionStatus })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiQuery({ name: 'search', required: false })
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('subscriptionStatus') subscriptionStatus?: SubscriptionStatus,
        @Query('isActive') isActive?: boolean,
        @Query('search') search?: string,
    ) {
        return this.schoolsService.findAll(page, limit, {
            subscriptionStatus,
            isActive,
            search,
        });
    }

    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HEADMASTER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get school by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.schoolsService.findOne(id);
    }

    @Get('code/:code')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get school by code (Super Admin only)' })
    findByCode(@Param('code') code: string) {
        return this.schoolsService.findByCode(code);
    }

    @Get('subdomain/:subdomain')
    @ApiOperation({ summary: 'Get school by subdomain (Public)' })
    findBySubdomain(@Param('subdomain') subdomain: string) {
        return this.schoolsService.findBySubdomain(subdomain);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HEADMASTER)
    @ApiOperation({ summary: 'Update school' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateSchoolDto: UpdateSchoolDto,
    ) {
        return this.schoolsService.update(id, updateSchoolDto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete school (Super Admin only)' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.schoolsService.remove(id);
    }

    @Patch(':id/subscription')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update school subscription (Super Admin only)' })
    updateSubscription(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('status') status: SubscriptionStatus,
        @Body('expiresAt') expiresAt?: Date,
    ) {
        return this.schoolsService.updateSubscription(id, status, expiresAt);
    }

    @Get(':id/subscription/valid')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HEADMASTER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Check if school subscription is valid' })
    async isSubscriptionValid(@Param('id', ParseUUIDPipe) id: string) {
        const isValid = await this.schoolsService.isSubscriptionValid(id);
        return { isValid };
    }

    @Post(':id/statistics')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HEADMASTER)
    @ApiOperation({ summary: 'Update school statistics' })
    async updateStatistics(@Param('id', ParseUUIDPipe) id: string) {
        await this.schoolsService.updateStatistics(id);
        return { message: 'Statistics updated successfully' };
    }
}
