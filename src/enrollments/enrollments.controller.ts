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
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Enrollments')
@ApiBearerAuth('JWT-auth')
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
    constructor(private readonly enrollmentsService: EnrollmentsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Enroll a student in a class' })
    @ApiResponse({ status: 201, description: 'Student enrolled successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input or already enrolled' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
        return this.enrollmentsService.create(createEnrollmentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all enrollments or filter by student/class' })
    @ApiQuery({ name: 'studentId', required: false, description: 'Filter by student UUID' })
    @ApiQuery({ name: 'classId', required: false, description: 'Filter by class UUID' })
    @ApiResponse({ status: 200, description: 'Returns list of enrollments' })
    findAll(
        @Query('studentId') studentId?: string,
        @Query('classId') classId?: string,
    ) {
        if (studentId) {
            return this.enrollmentsService.findByStudent(studentId);
        }
        if (classId) {
            return this.enrollmentsService.findByClass(classId);
        }
        return this.enrollmentsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get enrollment by ID' })
    @ApiParam({ name: 'id', description: 'Enrollment UUID' })
    @ApiResponse({ status: 200, description: 'Returns the enrollment' })
    @ApiResponse({ status: 404, description: 'Enrollment not found' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.enrollmentsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Update enrollment by ID' })
    @ApiParam({ name: 'id', description: 'Enrollment UUID' })
    @ApiResponse({ status: 200, description: 'Enrollment successfully updated' })
    @ApiResponse({ status: 404, description: 'Enrollment not found' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateEnrollmentDto: UpdateEnrollmentDto,
    ) {
        return this.enrollmentsService.update(id, updateEnrollmentDto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete enrollment by ID' })
    @ApiParam({ name: 'id', description: 'Enrollment UUID' })
    @ApiResponse({ status: 200, description: 'Enrollment successfully deleted' })
    @ApiResponse({ status: 404, description: 'Enrollment not found' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.enrollmentsService.remove(id);
    }
}
