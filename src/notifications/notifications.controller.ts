import { Post, Body, Param, Delete, ParseUUIDPipe, Patch, Get } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ApiController, ApiOperationDoc } from '../common/decorators/api.decorator';
import { NotificationQueryService } from './notifications.query.service';

@ApiController('Notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService, private readonly query: NotificationQueryService) { }

  @Post() @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateNotificationDto) { return this.service.create(dto); }

  @Post('broadcast') @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  broadcast(@Body() dto: BroadcastNotificationDto) { return this.service.broadcast(dto); }

  @Get() @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  findAll() { return this.query.findAll(); }

  @Get('my')
  findMyNotifications(@CurrentUser() user: any) { return this.query.findByUser(user.id); }

  @Get('my/unread')
  findMyUnread(@CurrentUser() user: any) { return this.query.findUnread(user.id); }

  @Get('my/unread-count')
  getUnreadCount(@CurrentUser() user: any) { return this.query.getUnreadCount(user.id); }

  @Get(':id') @ApiParam({ name: 'id', description: 'Notification UUID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.query.findOne(id); }

  @Patch(':id/read') @ApiParam({ name: 'id', description: 'Notification UUID' })
  markAsRead(@Param('id', ParseUUIDPipe) id: string) { return this.service.markAsRead(id); }

  @Patch('my/read-all')
  markAllAsRead(@CurrentUser() user: any) { return this.service.markAllAsRead(user.id); }

  @Delete(':id') @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
