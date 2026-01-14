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
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Classes')
@ApiBearerAuth('JWT-auth')
@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
    constructor(private readonly classesService: ClassesService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new class' })
    @ApiResponse({ status: 201, description: 'Class successfully created' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    create(@Body() createClassDto: CreateClassDto) {
        return this.classesService.create(createClassDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all classes or filter by academic year' })
    @ApiQuery({ name: 'academicYear', required: false, description: 'Filter by academic year (e.g., 2024-2025)' })
    @ApiResponse({ status: 200, description: 'Returns list of classes' })
    findAll(@Query('academicYear') academicYear?: string) {
        if (academicYear) {
            return this.classesService.findByAcademicYear(academicYear);
        }
        return this.classesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get class by ID' })
    @ApiParam({ name: 'id', description: 'Class UUID' })
    @ApiResponse({ status: 200, description: 'Returns the class' })
    @ApiResponse({ status: 404, description: 'Class not found' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.classesService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Update class by ID' })
    @ApiParam({ name: 'id', description: 'Class UUID' })
    @ApiResponse({ status: 200, description: 'Class successfully updated' })
    @ApiResponse({ status: 404, description: 'Class not found' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateClassDto: UpdateClassDto,
    ) {
        return this.classesService.update(id, updateClassDto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete class by ID' })
    @ApiParam({ name: 'id', description: 'Class UUID' })
    @ApiResponse({ status: 200, description: 'Class successfully deleted' })
    @ApiResponse({ status: 404, description: 'Class not found' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.classesService.remove(id);
    }

    @Patch(':id/teacher/:teacherId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Assign a teacher to a class' })
    @ApiParam({ name: 'id', description: 'Class UUID' })
    @ApiParam({ name: 'teacherId', description: 'Teacher UUID' })
    @ApiResponse({ status: 200, description: 'Teacher assigned to class' })
    @ApiResponse({ status: 404, description: 'Class or teacher not found' })
    assignTeacher(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('teacherId', ParseUUIDPipe) teacherId: string,
    ) {
        return this.classesService.assignTeacher(id, teacherId);
    }
}
