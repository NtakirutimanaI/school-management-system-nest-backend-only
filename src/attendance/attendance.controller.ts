import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { AttendanceQueryService } from './attendance.query.service';

@ApiTags('Attendance')
@ApiBearerAuth('JWT-auth')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly service: AttendanceService, private readonly query: AttendanceQueryService) { }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  create(@Body() dto: CreateAttendanceDto) { return this.service.create(dto); }

  @Post('bulk')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  bulkCreate(@Body() dto: BulkAttendanceDto) { return this.service.bulkCreate(dto); }

  @Get()
  findAll() { return this.query.findAll(); }

  @Get('student/:studentId')
  findByStudent(@Param('studentId', ParseUUIDPipe) id: string, @Query('startDate') s?: string, @Query('endDate') e?: string) {
    return this.query.findByStudent(id, s, e);
  }

  @Get('class/:classId')
  findByClass(@Param('classId', ParseUUIDPipe) id: string, @Query('date') d: string) {
    return this.query.findByClass(id, d);
  }

  @Get('stats/:studentId')
  getStats(@Param('studentId', ParseUUIDPipe) id: string) { return this.query.getStudentStats(id); }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.query.findOne(id); }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAttendanceDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
