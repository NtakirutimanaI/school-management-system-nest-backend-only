import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Exam } from '../../exams/entities/exam.entity';

@Entity('results')
@Unique(['studentId', 'examId'])
export class Result {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'marks_obtained', type: 'decimal', precision: 5, scale: 2 })
    marksObtained: number;

    @Column({ nullable: true })
    grade: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    percentage: number;

    @Column({ name: 'is_passed', default: false })
    isPassed: boolean;

    @Column({ nullable: true })
    remarks: string;

    @ManyToOne(() => Student, (student) => student.results, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @Column({ name: 'student_id' })
    studentId: string;

    @ManyToOne(() => Exam, (exam) => exam.results, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'exam_id' })
    exam: Exam;

    @Column({ name: 'exam_id' })
    examId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
