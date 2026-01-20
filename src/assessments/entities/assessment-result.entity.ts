import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import { Assessment } from './assessment.entity';
import { Student } from '../../students/entities/student.entity';

import { ApiProperty } from '@nestjs/swagger';

@Entity('assessment_results')
@Unique(['assessmentId', 'studentId']) // Ensure one mark per student per assessment
export class AssessmentResult {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({ name: 'marks_obtained', type: 'decimal', precision: 5, scale: 2 })
    marksObtained: number;

    @ApiProperty({ required: false, nullable: true })
    @Column({ type: 'text', nullable: true })
    remarks: string | null;

    @ManyToOne(() => Assessment, (assessment) => assessment.results, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'assessment_id' })
    assessment: Assessment;

    @ApiProperty()
    @Column({ name: 'assessment_id' })
    assessmentId: string;

    @ManyToOne(() => Student, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @ApiProperty()
    @Column({ name: 'student_id' })
    studentId: string;

    @ApiProperty({ required: false })
    @Column({ name: 'school_id', nullable: true })
    schoolId: string;

    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
