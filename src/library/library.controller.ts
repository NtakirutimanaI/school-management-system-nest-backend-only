import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ForbiddenException, Query } from '@nestjs/common';
import { LibraryService } from './library.service';
import { CreateBookDto } from './dto/create-book.dto';
import { IssueBookDto } from './dto/issue-book.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { StudentsService } from '../students/students.service';

@ApiTags('Library')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('library')
export class LibraryController {
    constructor(
        private readonly service: LibraryService,
        private readonly studentsService: StudentsService
    ) { }

    @Post('books')
    @Roles(UserRole.LIBRARIAN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Add a book' })
    addBook(@Body() dto: CreateBookDto) {
        return this.service.addBook(dto);
    }

    @Get('books')
    @ApiOperation({ summary: 'Browse books' })
    @ApiQuery({ name: 'search', required: false })
    findAllBooks(@Query('search') search: string) {
        return this.service.findAllBooks(search);
    }

    @Post('issue')
    @Roles(UserRole.LIBRARIAN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Issue a book to a student' })
    issueBook(@Body() dto: IssueBookDto) {
        return this.service.issueBook(dto);
    }

    @Post('return/:id')
    @Roles(UserRole.LIBRARIAN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Return a book' })
    returnBook(@Param('id') id: string) {
        return this.service.returnBook(id);
    }

    @Get('records')
    @Roles(UserRole.LIBRARIAN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'View all borrowing records' })
    getAllRecords() {
        return this.service.getAllRecords();
    }

    @Get('my-records')
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'View my borrowing history' })
    async getMyRecords(@Request() req) {
        const student = await this.studentsService.findByUserId(req.user.sub);
        if (!student) throw new ForbiddenException('Student profile not found');
        return this.service.getMyRecords(student.id);
    }
}
