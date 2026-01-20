import { Controller, Get, Post, Body, Param, Query, UseGuards, UploadedFile, UseInterceptors, Request, ForbiddenException, Patch } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { RecordMarksDto } from './dto/record-marks.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { TeachersService } from '../teachers/teachers.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Assessments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assessments')
export class AssessmentsController {
    constructor(
        private readonly assessmentsService: AssessmentsService,
        private readonly teachersService: TeachersService,
    ) { }

    @Post()
    @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOS)
    @ApiOperation({ summary: 'Create a new assessment column' })
    @ApiResponse({ status: 201, description: 'The assessment has been successfully created.' })
    @ApiResponse({ status: 400, description: 'Invalid input.' })
    create(@Body() createAssessmentDto: CreateAssessmentDto) {
        return this.assessmentsService.create(createAssessmentDto);
    }

    @Get()
    @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOS)
    @ApiOperation({ summary: 'List assessments with filtering' })
    @ApiQuery({ name: 'classId', required: false, description: 'Filter by Class ID' })
    @ApiQuery({ name: 'subjectId', required: false, description: 'Filter by Subject ID' })
    @ApiQuery({ name: 'term', required: false, description: 'Filter by Term' })
    @ApiQuery({ name: 'academicYear', required: false, description: 'Filter by Academic Year' })
    @ApiResponse({ status: 200, description: 'List of assessments found.' })
    async findAll(@Query() query: any, @Request() req) {
        let teacherId: string | undefined = undefined;

        // If user is a teacher, force filtering by their ID
        if (req.user.role === UserRole.TEACHER) {
            const teacher = await this.teachersService.findByUserId(req.user.sub);
            if (teacher) {
                teacherId = teacher.id;
            }
        }

        return this.assessmentsService.findAll(query, teacherId);
    }

    @Get(':id')
    @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOS)
    @ApiOperation({ summary: 'Get single assessment details' })
    @ApiParam({ name: 'id', description: 'Assessment ID' })
    @ApiResponse({ status: 200, description: 'The assessment details.' })
    @ApiResponse({ status: 404, description: 'Assessment not found.' })
    findOne(@Param('id') id: string) {
        return this.assessmentsService.findOne(id);
    }

    @Post('marks')
    @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOS)
    @ApiOperation({ summary: 'Record marks for an assessment' })
    @ApiResponse({ status: 201, description: 'Marks recorded successfully.' })
    recordMarks(@Body() recordMarksDto: RecordMarksDto) {
        return this.assessmentsService.recordMarks(recordMarksDto);
    }

    @Get(':id/marks')
    @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOS)
    @ApiOperation({ summary: 'Get marks grid for an assessment' })
    @ApiParam({ name: 'id', description: 'Assessment ID' })
    @ApiResponse({ status: 200, description: 'List of students with their marks for this assessment.' })
    getMarks(@Param('id') id: string) {
        return this.assessmentsService.getMarksForAssessment(id);
    }

    @Post(':id/upload')
    @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOS)
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({ summary: 'Upload marks via Excel' })
    @ApiParam({ name: 'id', description: 'Assessment ID' })
    @ApiResponse({ status: 201, description: 'Marks uploaded and processed successfully.' })
    uploadMarks(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        return this.assessmentsService.uploadMarks(id, file);
    }
    @Patch(':id/status')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.HEADMASTER, UserRole.DOS)
    @ApiOperation({ summary: 'Update assessment status (Approve/Publish)' })
    @ApiParam({ name: 'id', description: 'Assessment ID' })
    @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] } } } })
    @ApiResponse({ status: 200, description: 'Status updated.' })
    updateStatus(@Param('id') id: string, @Body('status') status: 'DRAFT' | 'PUBLISHED') {
        return this.assessmentsService.updateStatus(id, status);
    }

    @Get('student/:studentId/history')
    @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOS, UserRole.HEADMASTER)
    @ApiOperation({ summary: 'Get student assessment history' })
    @ApiParam({ name: 'studentId' })
    async getStudentHistory(@Param('studentId') studentId: string, @Request() req) {
        let teacherId: string | undefined = undefined;
        if (req.user.role === UserRole.TEACHER) {
            const teacher = await this.teachersService.findByUserId(req.user.sub);
            if (teacher) teacherId = teacher.id;
        }
        return this.assessmentsService.getStudentHistory(studentId, teacherId);
    }
}
