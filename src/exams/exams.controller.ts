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
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Exams')
@ApiBearerAuth('JWT-auth')
@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
    constructor(private readonly examsService: ExamsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Create a new exam' })
    @ApiResponse({ status: 201, description: 'Exam successfully created' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    create(@Body() createExamDto: CreateExamDto) {
        return this.examsService.create(createExamDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all exams or filter by class/subject' })
    @ApiQuery({ name: 'classId', required: false, description: 'Filter by class UUID' })
    @ApiQuery({ name: 'subjectId', required: false, description: 'Filter by subject UUID' })
    @ApiResponse({ status: 200, description: 'Returns list of exams' })
    findAll(
        @Query('classId') classId?: string,
        @Query('subjectId') subjectId?: string,
    ) {
        if (classId) {
            return this.examsService.findByClass(classId);
        }
        if (subjectId) {
            return this.examsService.findBySubject(subjectId);
        }
        return this.examsService.findAll();
    }

    @Get('upcoming')
    @ApiOperation({ summary: 'Get upcoming exams' })
    @ApiResponse({ status: 200, description: 'Returns list of upcoming exams' })
    findUpcoming() {
        return this.examsService.findUpcoming();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get exam by ID' })
    @ApiParam({ name: 'id', description: 'Exam UUID' })
    @ApiResponse({ status: 200, description: 'Returns the exam' })
    @ApiResponse({ status: 404, description: 'Exam not found' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.examsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Update exam by ID' })
    @ApiParam({ name: 'id', description: 'Exam UUID' })
    @ApiResponse({ status: 200, description: 'Exam successfully updated' })
    @ApiResponse({ status: 404, description: 'Exam not found' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateExamDto: UpdateExamDto,
    ) {
        return this.examsService.update(id, updateExamDto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete exam by ID' })
    @ApiParam({ name: 'id', description: 'Exam UUID' })
    @ApiResponse({ status: 200, description: 'Exam successfully deleted' })
    @ApiResponse({ status: 404, description: 'Exam not found' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.examsService.remove(id);
    }
}
