import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Subject } from '../../subjects/entities/subject.entity';
import { Class } from '../../classes/entities/class.entity';
import { Term } from '../../common/enums/education-system.enum';
import { AssessmentType, AssessmentCategory } from '../../common/enums/assessment-type.enum';
import { AssessmentResult } from './assessment-result.entity';

import { ApiProperty } from '@nestjs/swagger';

@Entity('assessments')
export class Assessment {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    name: string; // e.g. "Quiz 1", "Assessment 2"

    @ApiProperty({ enum: AssessmentType })
    @Column({
        type: 'enum',
        enum: AssessmentType,
    })
    type: AssessmentType;

    @ApiProperty({ enum: AssessmentCategory })
    @Column({
        type: 'enum',
        enum: AssessmentCategory,
        default: AssessmentCategory.FORMATIVE,
    })
    category: AssessmentCategory;

    @ApiProperty()
    @Column({ name: 'max_marks', type: 'decimal', precision: 5, scale: 2 })
    maxMarks: number;

    @ApiProperty()
    @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
    weightage: number; // Percent contribution to final grade

    @ApiProperty()
    @Column({ name: 'academic_year' })
    academicYear: string;

    @ApiProperty({ enum: Term })
    @Column({
        type: 'enum',
        enum: Term,
    })
    term: Term;

    @ManyToOne(() => Subject)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @ApiProperty()
    @Column({ name: 'subject_id' })
    subjectId: string;

    @ManyToOne(() => Class)
    @JoinColumn({ name: 'class_id' })
    class: Class;

    @ApiProperty()
    @Column({ name: 'class_id' })
    classId: string;

    @OneToMany(() => AssessmentResult, (result) => result.assessment)
    results: AssessmentResult[];

    @ApiProperty({ required: false })
    @Column({ name: 'school_id', nullable: true })
    schoolId: string;

    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ApiProperty({ enum: ['DRAFT', 'PUBLISHED'] })
    @Column({
        type: 'enum',
        enum: ['DRAFT', 'PUBLISHED'],
        default: 'DRAFT'
    })
    status: 'DRAFT' | 'PUBLISHED';
}
