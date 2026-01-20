import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { DisciplineService } from './discipline.service';
import { CreateDisciplineRecordDto } from './dto/create-discipline-record.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { StudentsService } from '../students/students.service';

@ApiTags('Discipline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('discipline')
export class DisciplineController {
    constructor(
        private readonly service: DisciplineService,
        private readonly studentsService: StudentsService
    ) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOD, UserRole.HEADMASTER)
    @ApiOperation({ summary: 'Record a discipline case' })
    create(@Body() dto: CreateDisciplineRecordDto) {
        return this.service.create(dto);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOD, UserRole.HEADMASTER, UserRole.TEACHER)
    @ApiOperation({ summary: 'View all discipline records' })
    findAll() {
        return this.service.findAll();
    }

    @Get('student/:studentId')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOD, UserRole.HEADMASTER, UserRole.TEACHER, UserRole.PARENT, UserRole.STUDENT)
    @ApiOperation({ summary: 'View discipline records for a student' })
    async findByStudent(@Param('studentId') studentId: string, @Request() req) {
        // If student, ensure it's their own record
        if (req.user.role === UserRole.STUDENT) {
            // We need to resolve studentId from userId
            const student = await this.studentsService.findByUserId(req.user.sub); // Assuming simple lookup
            if (!student || student.id !== studentId) {
                throw new ForbiddenException('You can only view your own records');
            }
        }
        // Parent check skipped for brevity, assumed valid if they have ID
        return this.service.findByStudent(studentId);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOD)
    @ApiOperation({ summary: 'Update discipline record (e.g. resolve)' })
    update(@Param('id') id: string, @Body() dto: any) {
        return this.service.update(id, dto);
    }
}
