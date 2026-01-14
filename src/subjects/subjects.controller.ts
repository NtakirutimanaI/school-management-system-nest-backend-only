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
} from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Subjects')
@ApiBearerAuth('JWT-auth')
@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectsController {
    constructor(private readonly subjectsService: SubjectsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new subject' })
    @ApiResponse({ status: 201, description: 'Subject successfully created' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    create(@Body() createSubjectDto: CreateSubjectDto) {
        return this.subjectsService.create(createSubjectDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all subjects' })
    @ApiResponse({ status: 200, description: 'Returns list of subjects' })
    findAll() {
        return this.subjectsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get subject by ID' })
    @ApiParam({ name: 'id', description: 'Subject UUID' })
    @ApiResponse({ status: 200, description: 'Returns the subject' })
    @ApiResponse({ status: 404, description: 'Subject not found' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.subjectsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Update subject by ID' })
    @ApiParam({ name: 'id', description: 'Subject UUID' })
    @ApiResponse({ status: 200, description: 'Subject successfully updated' })
    @ApiResponse({ status: 404, description: 'Subject not found' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateSubjectDto: UpdateSubjectDto,
    ) {
        return this.subjectsService.update(id, updateSubjectDto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete subject by ID' })
    @ApiParam({ name: 'id', description: 'Subject UUID' })
    @ApiResponse({ status: 200, description: 'Subject successfully deleted' })
    @ApiResponse({ status: 404, description: 'Subject not found' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.subjectsService.remove(id);
    }
}
