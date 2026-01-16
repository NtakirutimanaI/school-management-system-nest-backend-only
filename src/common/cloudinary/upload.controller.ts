import {
    Controller,
    Post,
    Delete,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    Body,
    BadRequestException,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiConsumes,
    ApiBody,
    ApiBearerAuth,
    ApiResponse,
} from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';

@ApiTags('File Upload')
@ApiBearerAuth('JWT-auth')
@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @Post('image')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Upload a single image' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                folder: { type: 'string', description: 'Optional folder name' },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @UploadedFile() file: Express.Multer.File,
        @Body('folder') folder?: string,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Only image files are allowed');
        }

        const result = await this.cloudinaryService.uploadFile(file, folder, 'image');
        return {
            message: 'Image uploaded successfully',
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
        };
    }

    @Post('video')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Upload a single video' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                folder: { type: 'string', description: 'Optional folder name' },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Video uploaded successfully' })
    @UseInterceptors(FileInterceptor('file'))
    async uploadVideo(
        @UploadedFile() file: Express.Multer.File,
        @Body('folder') folder?: string,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Validate file type
        const allowedMimeTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Only video files are allowed');
        }

        const result = await this.cloudinaryService.uploadFile(file, folder, 'video');
        return {
            message: 'Video uploaded successfully',
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            duration: result.duration,
        };
    }

    @Post('document')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Upload a document (PDF, DOC, DOCX, etc.)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                folder: { type: 'string', description: 'Optional folder name' },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
    @UseInterceptors(FileInterceptor('file'))
    async uploadDocument(
        @UploadedFile() file: Express.Multer.File,
        @Body('folder') folder?: string,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Validate file type
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Invalid document type');
        }

        const result = await this.cloudinaryService.uploadFile(file, folder, 'raw');
        return {
            message: 'Document uploaded successfully',
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
        };
    }

    @Post('multiple')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: 'Upload multiple files (images, videos, or documents)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: { type: 'array', items: { type: 'string', format: 'binary' } },
                folder: { type: 'string', description: 'Optional folder name' },
                type: { type: 'string', enum: ['image', 'video', 'raw'], description: 'File type' },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
    @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
    async uploadMultiple(
        @UploadedFiles() files: Express.Multer.File[],
        @Body('folder') folder?: string,
        @Body('type') type: 'image' | 'video' | 'raw' = 'image',
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }

        const results = await this.cloudinaryService.uploadMultipleFiles(files, folder, type);
        return {
            message: `${results.length} file(s) uploaded successfully`,
            files: results.map((result) => ({
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
            })),
        };
    }

    @Delete('file')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a file from Cloudinary' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                publicId: { type: 'string', description: 'Public ID of the file to delete' },
                type: { type: 'string', enum: ['image', 'video', 'raw'], description: 'File type' },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'File deleted successfully' })
    async deleteFile(
        @Body('publicId') publicId: string,
        @Body('type') type: 'image' | 'video' | 'raw' = 'image',
    ) {
        if (!publicId) {
            throw new BadRequestException('Public ID is required');
        }

        const result = await this.cloudinaryService.deleteFile(publicId, type);
        return {
            message: 'File deleted successfully',
            result,
        };
    }
}
