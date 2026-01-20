import { Controller, Get, Post, Body, UseGuards, UseInterceptors, UploadedFile, Request, BadRequestException, Query } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { MaterialType } from './entities/material.entity';

@ApiTags('Learning Materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('materials')
export class MaterialsController {
    constructor(
        private readonly service: MaterialsService,
        private readonly cloudinary: CloudinaryService
    ) { }

    @Post()
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Upload learning material (Lesson Plan, Notes, etc)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                type: { type: 'string', enum: Object.values(MaterialType) },
                subjectId: { type: 'string', format: 'uuid' },
                classId: { type: 'string', format: 'uuid' },
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async create(@Body() dto: CreateMaterialDto, @UploadedFile() file: Express.Multer.File, @Request() req) {
        if (!file && !dto.fileUrl) {
            throw new BadRequestException('File is required');
        }

        if (file) {
            // Upload to cloudinary
            const result = await this.cloudinary.uploadFile(file, 'materials', 'raw');
            dto.fileUrl = result.secure_url;
        }

        return this.service.create(dto, req.user.sub);
    }

    @Get()
    @ApiOperation({ summary: 'Browse materials' })
    @ApiQuery({ name: 'classId', required: false })
    @ApiQuery({ name: 'subjectId', required: false })
    @ApiQuery({ name: 'teacherId', required: false })
    findAll(@Query() query: any) {
        return this.service.findAll(query);
    }

    @Get('me')
    @ApiOperation({ summary: 'My uploaded materials' })
    getMyMaterials(@Request() req) {
        return this.service.findByTeacher(req.user.sub);
    }
}
