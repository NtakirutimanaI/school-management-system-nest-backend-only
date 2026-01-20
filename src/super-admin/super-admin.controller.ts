import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Put } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { CreateSchoolDto } from '../schools/dto/create-school.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Super Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('super-admin')
export class SuperAdminController {
    constructor(private readonly superAdminService: SuperAdminService) { }

    // --- Schools ---
    @Post('schools')
    @ApiOperation({ summary: 'Create a new school tenant' })
    @ApiResponse({ status: 201, description: 'School created successfully.' })
    createSchool(@Body() dto: CreateSchoolDto) {
        return this.superAdminService.createSchool(dto);
    }

    @Get('schools')
    @ApiOperation({ summary: 'List all schools' })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiResponse({ status: 200, description: 'List of schools.' })
    getAllSchools(@Query('page') page: number, @Query('limit') limit: number, @Query('search') search: string) {
        return this.superAdminService.getAllSchools(page, limit, search);
    }

    @Patch('schools/:id/status')
    @ApiOperation({ summary: 'Activate/Deactivate school' })
    @ApiBody({ schema: { type: 'object', properties: { isActive: { type: 'boolean' } } } })
    toggleSchoolStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
        return this.superAdminService.toggleSchoolStatus(id, isActive);
    }

    // --- Users ---
    @Get('users')
    @ApiOperation({ summary: 'List all users in the system' })
    @ApiQuery({ name: 'role', enum: UserRole, required: false })
    @ApiResponse({ status: 200, description: 'List of users.' })
    getAllUsers(@Query('page') page: number, @Query('limit') limit: number, @Query('role') role: UserRole) {
        return this.superAdminService.getAllUsers(page, limit, role);
    }

    @Post('users')
    @ApiOperation({ summary: 'Create a user directly' })
    createUser(@Body() dto: CreateUserDto) {
        return this.superAdminService.createUser(dto);
    }

    @Patch('users/:id/status')
    @ApiOperation({ summary: 'Activate/Deactivate user' })
    @ApiBody({ schema: { type: 'object', properties: { isActive: { type: 'boolean' } } } })
    updateUserStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
        return this.superAdminService.updateUserStatus(id, isActive);
    }

    @Patch('users/:id/role')
    @ApiOperation({ summary: 'Assign role to user' })
    @ApiBody({ schema: { type: 'object', properties: { role: { enum: Object.values(UserRole) } } } })
    updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
        return this.superAdminService.assignRole(id, role);
    }

    // --- Settings ---
    @Get('settings')
    @ApiOperation({ summary: 'Get all system settings' })
    getSettings() {
        return this.superAdminService.getSettings();
    }

    @Put('settings/:key')
    @ApiOperation({ summary: 'Update a system setting' })
    updateSetting(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
        return this.superAdminService.updateSetting(key, dto);
    }

    // --- Audit Logs ---
    @Get('audit-logs')
    @ApiOperation({ summary: 'View system audit logs' })
    getAuditLogs() {
        return this.superAdminService.getAuditLogs();
    }

    // --- Backups ---
    @Post('backups')
    @ApiOperation({ summary: 'Trigger a manual system backup' })
    triggerBackup() {
        return this.superAdminService.triggerBackup();
    }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get system-wide dashboard statistics' })
    getDashboardStats() {
        return this.superAdminService.getDashboardStats();
    }
}
