import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from '../../config/cloudinary.config';
import { UploadController } from './upload.controller';

@Module({
    controllers: [UploadController],
    providers: [CloudinaryProvider, CloudinaryService],
    exports: [CloudinaryService],
})
export class CloudinaryModule { }
