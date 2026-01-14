import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseUUIDPipe,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Attendance')
@ApiBearerAuth('JWT-auth')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Record attendance for a student' })
    @ApiResponse({ status: 201, description: 'Attendance recorded successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    create(@Body() createAttendanceDto: CreateAttendanceDto) {
        return this.attendanceService.create(createAttendanceDto);
    }

    @Post('bulk')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Record attendance for multiple students' })
    @ApiResponse({ status: 201, description: 'Bulk attendance recorded successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    bulkCreate(@Body() bulkAttendanceDto: BulkAttendanceDto) {
        return this.attendanceService.bulkCreate(bulkAttendanceDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all attendance records' })
    @ApiResponse({ status: 200, description: 'Returns all attendance records' })
    findAll() {
        return this.attendanceService.findAll();
    }

    @Get('student/:studentId')
    @ApiOperation({ summary: 'Get attendance records for a student' })
    @ApiParam({ name: 'studentId', description: 'Student UUID' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Returns student attendance records' })
    findByStudent(
        @Param('studentId', ParseUUIDPipe) studentId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.attendanceService.findByStudent(studentId, startDate, endDate);
    }

    @Get('class/:classId')
    @ApiOperation({ summary: 'Get attendance for a class on a specific date' })
    @ApiParam({ name: 'classId', description: 'Class UUID' })
    @ApiQuery({ name: 'date', required: true, description: 'Date (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Returns class attendance for the date' })
    findByClass(
        @Param('classId', ParseUUIDPipe) classId: string,
        @Query('date') date: string,
    ) {
        return this.attendanceService.findByClass(classId, date);
    }

    @Get('stats/:studentId')
    @ApiOperation({ summary: 'Get attendance statistics for a student' })
    @ApiParam({ name: 'studentId', description: 'Student UUID' })
    @ApiQuery({ name: 'academicYear', required: true, description: 'Academic year (e.g., 2024-2025)' })
    @ApiResponse({ status: 200, description: 'Returns attendance statistics' })
    getStats(@Param('studentId', ParseUUIDPipe) studentId: string, @Query('academicYear') academicYear: string) {
        return this.attendanceService.getStudentAttendanceStats(studentId, academicYear);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get attendance record by ID' })
    @ApiParam({ name: 'id', description: 'Attendance record UUID' })
    @ApiResponse({ status: 200, description: 'Returns the attendance record' })
    @ApiResponse({ status: 404, description: 'Attendance record not found' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.attendanceService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Update attendance record' })
    @ApiParam({ name: 'id', description: 'Attendance record UUID' })
    @ApiResponse({ status: 200, description: 'Attendance updated successfully' })
    @ApiResponse({ status: 404, description: 'Attendance record not found' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateAttendanceDto: UpdateAttendanceDto,
    ) {
        return this.attendanceService.update(id, updateAttendanceDto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete attendance record' })
    @ApiParam({ name: 'id', description: 'Attendance record UUID' })
    @ApiResponse({ status: 200, description: 'Attendance deleted successfully' })
    @ApiResponse({ status: 404, description: 'Attendance record not found' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.attendanceService.remove(id);
    }
}
