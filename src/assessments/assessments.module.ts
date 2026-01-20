import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentsService } from './assessments.service';
import { AssessmentsController } from './assessments.controller';
import { Assessment } from './entities/assessment.entity';
import { AssessmentResult } from './entities/assessment-result.entity';
import { Student } from '../students/entities/student.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Class } from '../classes/entities/class.entity';
import { TeachersModule } from '../teachers/teachers.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Assessment,
            AssessmentResult,
            Student,
            Subject,
            Class
        ]),
        TeachersModule,
    ],
    controllers: [AssessmentsController],
    providers: [AssessmentsService],
    exports: [AssessmentsService],
})
export class AssessmentsModule { }
