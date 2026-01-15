import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ExamsQueryService } from './exams.query.service';

@ApiTags('Exams')
@ApiBearerAuth('JWT-auth')
@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
  constructor(private readonly service: ExamsService, private readonly query: ExamsQueryService) { }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  create(@Body() dto: CreateExamDto) { return this.service.create(dto); }

  @Get()
  findAll(@Query('classId') c?: string, @Query('subjectId') s?: string) {
    if (c) return this.query.findByClass(c);
    if (s) return this.query.findBySubject(s);
    return this.query.findAll();
  }

  @Get('upcoming')
  findUpcoming() { return this.query.findUpcoming(); }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.query.findOne(id); }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateExamDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
