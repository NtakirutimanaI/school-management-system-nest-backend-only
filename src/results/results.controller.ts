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
import { ResultsService } from './results.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { BulkResultDto } from './dto/bulk-result.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Results')
@ApiBearerAuth('JWT-auth')
@Controller('results')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResultsController {
    constructor(private readonly resultsService: ResultsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Create an exam result' })
    @ApiResponse({ status: 201, description: 'Result successfully created' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    create(@Body() createResultDto: CreateResultDto) {
        return this.resultsService.create(createResultDto);
    }

    @Post('bulk')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Create multiple exam results at once' })
    @ApiResponse({ status: 201, description: 'Results successfully created' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    bulkCreate(@Body() bulkResultDto: BulkResultDto) {
        return this.resultsService.bulkCreate(bulkResultDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all results or filter by student/exam' })
    @ApiQuery({ name: 'studentId', required: false, description: 'Filter by student UUID' })
    @ApiQuery({ name: 'examId', required: false, description: 'Filter by exam UUID' })
    @ApiResponse({ status: 200, description: 'Returns list of results' })
    findAll(
        @Query('studentId') studentId?: string,
        @Query('examId') examId?: string,
    ) {
        if (studentId) {
            return this.resultsService.findByStudent(studentId);
        }
        if (examId) {
            return this.resultsService.findByExam(examId);
        }
        return this.resultsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get result by ID' })
    @ApiParam({ name: 'id', description: 'Result UUID' })
    @ApiResponse({ status: 200, description: 'Returns the result' })
    @ApiResponse({ status: 404, description: 'Result not found' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.resultsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Update result by ID' })
    @ApiParam({ name: 'id', description: 'Result UUID' })
    @ApiResponse({ status: 200, description: 'Result successfully updated' })
    @ApiResponse({ status: 404, description: 'Result not found' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateResultDto: UpdateResultDto,
    ) {
        return this.resultsService.update(id, updateResultDto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete result by ID' })
    @ApiParam({ name: 'id', description: 'Result UUID' })
    @ApiResponse({ status: 200, description: 'Result successfully deleted' })
    @ApiResponse({ status: 404, description: 'Result not found' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.resultsService.remove(id);
    }
}
