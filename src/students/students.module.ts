import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Student]), CloudinaryModule],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule { }
