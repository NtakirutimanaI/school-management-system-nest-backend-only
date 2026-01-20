import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { Material } from './entities/material.entity';
import { TeachersModule } from '../teachers/teachers.module';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Material]),
        TeachersModule,
        CloudinaryModule,
    ],
    controllers: [MaterialsController],
    providers: [MaterialsService],
})
export class MaterialsModule { }
