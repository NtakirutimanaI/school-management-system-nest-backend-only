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
import { Class } from '../../classes/entities/class.entity';

@Entity('enrollments')
@Unique(['studentId', 'classId', 'academicYear'])
export class Enrollment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'academic_year' })
    academicYear: string;

    @Column({ name: 'enrollment_date', type: 'date', default: () => 'CURRENT_DATE' })
    enrollmentDate: Date;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ nullable: true })
    remarks: string;

    @ManyToOne(() => Student, (student) => student.enrollments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @Column({ name: 'student_id' })
    studentId: string;

    @ManyToOne(() => Class, (classEntity) => classEntity.enrollments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'class_id' })
    class: Class;

    @Column({ name: 'class_id' })
    classId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
