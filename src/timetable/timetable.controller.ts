import { Controller, Get, Post, Body, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { CreateTimetableEntryDto } from './dto/create-timetable-entry.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Timetable')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('timetable')
export class TimetableController {
    constructor(private readonly service: TimetableService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOS)
    @ApiOperation({ summary: 'Add a timetable entry' })
    create(@Body() dto: CreateTimetableEntryDto) {
        return this.service.create(dto);
    }

    @Get('class/:classId')
    @ApiOperation({ summary: 'Get timetable for a class' })
    @ApiResponse({ status: 200, description: 'Class timetable.' })
    findByClass(@Param('classId') classId: string) {
        return this.service.findByClass(classId);
    }

    @Get('teacher/:teacherId')
    @ApiOperation({ summary: 'Get timetable for a teacher' })
    @ApiResponse({ status: 200, description: 'Teacher timetable.' })
    findByTeacher(@Param('teacherId') teacherId: string) {
        return this.service.findByTeacher(teacherId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOS)
    @ApiOperation({ summary: 'Remove a timetable entry' })
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
