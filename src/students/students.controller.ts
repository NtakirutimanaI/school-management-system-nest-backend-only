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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Students')
@ApiBearerAuth('JWT-auth')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new student' })
    @ApiResponse({ status: 201, description: 'Student successfully created' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    create(@Body() createStudentDto: CreateStudentDto) {
        return this.studentsService.create(createStudentDto);
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Get all students or filter by class' })
    @ApiQuery({ name: 'classId', required: false, description: 'Filter by class UUID' })
    @ApiResponse({ status: 200, description: 'Returns list of students' })
    findAll(@Query('classId') classId?: string) {
        if (classId) {
            return this.studentsService.findByClass(classId);
        }
        return this.studentsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get student by ID' })
    @ApiParam({ name: 'id', description: 'Student UUID' })
    @ApiResponse({ status: 200, description: 'Returns the student' })
    @ApiResponse({ status: 404, description: 'Student not found' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.studentsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Update student by ID' })
    @ApiParam({ name: 'id', description: 'Student UUID' })
    @ApiResponse({ status: 200, description: 'Student successfully updated' })
    @ApiResponse({ status: 404, description: 'Student not found' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateStudentDto: UpdateStudentDto,
    ) {
        return this.studentsService.update(id, updateStudentDto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete student by ID' })
    @ApiParam({ name: 'id', description: 'Student UUID' })
    @ApiResponse({ status: 200, description: 'Student successfully deleted' })
    @ApiResponse({ status: 404, description: 'Student not found' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.studentsService.remove(id);
    }

    @Patch(':id/assign-class/:classId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Assign student to a class' })
    @ApiParam({ name: 'id', description: 'Student UUID' })
    @ApiParam({ name: 'classId', description: 'Class UUID' })
    @ApiResponse({ status: 200, description: 'Student assigned to class' })
    @ApiResponse({ status: 404, description: 'Student or class not found' })
    assignToClass(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('classId', ParseUUIDPipe) classId: string,
    ) {
        return this.studentsService.assignToClass(id, classId);
    }
}
