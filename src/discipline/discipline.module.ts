import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisciplineService } from './discipline.service';
import { DisciplineController } from './discipline.controller';
import { DisciplineRecord } from './entities/discipline-record.entity';
import { StudentsModule } from '../students/students.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([DisciplineRecord]),
        StudentsModule,
    ],
    controllers: [DisciplineController],
    providers: [DisciplineService],
})
export class DisciplineModule { }
