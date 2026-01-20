import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ResourceRequestsService } from './resource-requests.service';
import { CreateResourceRequestDto } from './dto/create-resource-request.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ResourceRequestStatus } from './entities/resource-request.entity';

@ApiTags('Resource Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('resource-requests')
export class ResourceRequestsController {
    constructor(private readonly service: ResourceRequestsService) { }

    @Post()
    @Roles(UserRole.TEACHER)
    @ApiOperation({ summary: 'Request teaching resources' })
    create(@Body() dto: CreateResourceRequestDto, @Request() req) {
        return this.service.create(dto, req.user.sub);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.HEADMASTER, UserRole.DOS)
    @ApiOperation({ summary: 'View all resource requests' })
    findAll() {
        return this.service.findAll();
    }

    @Get('me')
    @Roles(UserRole.TEACHER)
    @ApiOperation({ summary: 'View my requests' })
    getMyRequests(@Request() req) {
        return this.service.findByTeacher(req.user.sub);
    }

    @Patch(':id/status')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.HEADMASTER, UserRole.DOS)
    @ApiOperation({ summary: 'Update request status' })
    @ApiBody({ schema: { type: 'object', properties: { status: { enum: Object.values(ResourceRequestStatus) }, comment: { type: 'string' } } } })
    updateStatus(@Param('id') id: string, @Body('status') status: ResourceRequestStatus, @Body('comment') comment?: string) {
        return this.service.updateStatus(id, status, comment);
    }
}
