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
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
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
    constructor(private readonly teachersService: TeachersService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new teacher' })
    @ApiResponse({ status: 201, description: 'Teacher successfully created' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    create(@Body() createTeacherDto: CreateTeacherDto) {
        return this.teachersService.create(createTeacherDto);
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all teachers' })
    @ApiResponse({ status: 200, description: 'Returns list of teachers' })
    findAll() {
        return this.teachersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get teacher by ID' })
    @ApiParam({ name: 'id', description: 'Teacher UUID' })
    @ApiResponse({ status: 200, description: 'Returns the teacher' })
    @ApiResponse({ status: 404, description: 'Teacher not found' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.teachersService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Update teacher by ID' })
    @ApiParam({ name: 'id', description: 'Teacher UUID' })
    @ApiResponse({ status: 200, description: 'Teacher successfully updated' })
    @ApiResponse({ status: 404, description: 'Teacher not found' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateTeacherDto: UpdateTeacherDto,
    ) {
        return this.teachersService.update(id, updateTeacherDto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete teacher by ID' })
    @ApiParam({ name: 'id', description: 'Teacher UUID' })
    @ApiResponse({ status: 200, description: 'Teacher successfully deleted' })
    @ApiResponse({ status: 404, description: 'Teacher not found' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.teachersService.remove(id);
    }

    @Patch(':id/subjects')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Assign subjects to teacher' })
    @ApiParam({ name: 'id', description: 'Teacher UUID' })
    @ApiBody({ schema: { properties: { subjectIds: { type: 'array', items: { type: 'string' } } } } })
    @ApiResponse({ status: 200, description: 'Subjects assigned to teacher' })
    @ApiResponse({ status: 404, description: 'Teacher not found' })
    assignSubjects(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('subjectIds') subjectIds: string[],
    ) {
        return this.teachersService.assignSubjects(id, subjectIds);
    }
}
