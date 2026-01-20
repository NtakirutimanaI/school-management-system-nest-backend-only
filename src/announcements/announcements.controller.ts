import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('announcements')
export class AnnouncementsController {
    constructor(private readonly service: AnnouncementsService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.HEADMASTER, UserRole.DOS, UserRole.TEACHER)
    @ApiOperation({ summary: 'Post a new announcement' })
    create(@Body() dto: CreateAnnouncementDto, @Request() req) {
        return this.service.create(dto, req.user.sub);
    }

    @Get()
    @ApiOperation({ summary: 'Get announcements visible to you' })
    @ApiResponse({ status: 200, description: 'List of announcements.' })
    findAll(@Request() req) {
        return this.service.findAll(req.user.role);
    }
}
