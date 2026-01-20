import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Academic Calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('calendar')
export class CalendarController {
    constructor(private readonly calendarService: CalendarService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.HEADMASTER, UserRole.DOS)
    @ApiOperation({ summary: 'Create a calendar event' })
    @ApiResponse({ status: 201, description: 'Event created.' })
    create(@Body() dto: CreateEventDto) {
        return this.calendarService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get academic calendar' })
    @ApiResponse({ status: 200, description: 'List of events.' })
    findAll() {
        return this.calendarService.findAll();
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.HEADMASTER, UserRole.DOS)
    @ApiOperation({ summary: 'Update an event' })
    @ApiParam({ name: 'id' })
    @ApiResponse({ status: 200, description: 'Event updated.' })
    update(@Param('id') id: string, @Body() dto: CreateEventDto) {
        return this.calendarService.update(id, dto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.HEADMASTER, UserRole.DOS)
    @ApiOperation({ summary: 'Delete an event' })
    @ApiParam({ name: 'id' })
    @ApiResponse({ status: 200, description: 'Event deleted.' })
    remove(@Param('id') id: string) {
        return this.calendarService.remove(id);
    }
}
