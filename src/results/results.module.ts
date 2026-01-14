import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';
import { Result } from './entities/result.entity';
import { Exam } from '../exams/entities/exam.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Result, Exam])],
    controllers: [ResultsController],
    providers: [ResultsService],
    exports: [ResultsService],
})
export class ResultsModule { }
