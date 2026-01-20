import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Teachers')
@ApiBearerAuth('JWT-auth')
@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
  constructor(private readonly service: TeachersService) { }

  @Get('me')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Get my teacher profile (classes, subjects)' })
  getProfile(@Request() req) {
    return this.service.findByUserId(req.user.sub);
  }

  @Post() @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateTeacherDto) { return this.service.create(dto); }

  @Get() @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  findAll() { return this.service.findAll(); }

  @Get(':id') @ApiParam({ name: 'id', description: 'Teacher UUID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }

  @Patch(':id') @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTeacherDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id') @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }

  @Patch(':id/subjects') @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  assignSubjects(@Param('id', ParseUUIDPipe) id: string, @Body('subjectIds') ids: string[]) {
    return this.service.assignSubjects(id, ids);
  }
}
