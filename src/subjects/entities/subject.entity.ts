import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    OneToMany,
} from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Exam } from '../../exams/entities/exam.entity';

@Entity('subjects')
export class Subject {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    code: string;

    @Column({ nullable: true })
    description: string;

    @Column({ name: 'credit_hours', type: 'int', default: 1 })
    creditHours: number;

    @Column({ name: 'is_mandatory', default: true })
    isMandatory: boolean;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @ManyToMany(() => Teacher, (teacher) => teacher.subjects)
    teachers: Teacher[];

    @OneToMany(() => Exam, (exam) => exam.subject)
    exams: Exam[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
