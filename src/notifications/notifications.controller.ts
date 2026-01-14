import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    ParseUUIDPipe,
    Patch,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a notification for a specific user' })
    @ApiResponse({ status: 201, description: 'Notification created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    create(@Body() createNotificationDto: CreateNotificationDto) {
        return this.notificationsService.create(createNotificationDto);
    }

    @Post('broadcast')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Broadcast notification to multiple users or roles' })
    @ApiResponse({ status: 201, description: 'Broadcast sent successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    broadcast(@Body() broadcastDto: BroadcastNotificationDto) {
        return this.notificationsService.broadcast(broadcastDto);
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all notifications (Admin only)' })
    @ApiResponse({ status: 200, description: 'Returns all notifications' })
    findAll() {
        return this.notificationsService.findAll();
    }

    @Get('my')
    @ApiOperation({ summary: 'Get my notifications' })
    @ApiResponse({ status: 200, description: 'Returns current user notifications' })
    findMyNotifications(@CurrentUser() user: any) {
        return this.notificationsService.findByUser(user.id);
    }

    @Get('my/unread')
    @ApiOperation({ summary: 'Get my unread notifications' })
    @ApiResponse({ status: 200, description: 'Returns unread notifications' })
    findMyUnread(@CurrentUser() user: any) {
        return this.notificationsService.findUnread(user.id);
    }

    @Get('my/unread-count')
    @ApiOperation({ summary: 'Get count of unread notifications' })
    @ApiResponse({ status: 200, description: 'Returns unread notification count' })
    getUnreadCount(@CurrentUser() user: any) {
        return this.notificationsService.getUnreadCount(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get notification by ID' })
    @ApiParam({ name: 'id', description: 'Notification UUID' })
    @ApiResponse({ status: 200, description: 'Returns the notification' })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.notificationsService.findOne(id);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiParam({ name: 'id', description: 'Notification UUID' })
    @ApiResponse({ status: 200, description: 'Notification marked as read' })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    markAsRead(@Param('id', ParseUUIDPipe) id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Patch('my/read-all')
    @ApiOperation({ summary: 'Mark all my notifications as read' })
    @ApiResponse({ status: 200, description: 'All notifications marked as read' })
    markAllAsRead(@CurrentUser() user: any) {
        return this.notificationsService.markAllAsRead(user.id);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete notification by ID' })
    @ApiParam({ name: 'id', description: 'Notification UUID' })
    @ApiResponse({ status: 200, description: 'Notification successfully deleted' })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.notificationsService.remove(id);
    }
}
