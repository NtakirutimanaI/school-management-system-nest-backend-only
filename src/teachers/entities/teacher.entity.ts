import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    ManyToMany,
    JoinColumn,
    JoinTable,
    OneToMany,
} from 'typeorm';
import { Gender } from '../../common/enums/gender.enum';
import { User } from '../../users/entities/user.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { Class } from '../../classes/entities/class.entity';

@Entity('teachers')
export class Teacher {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'employee_id', unique: true })
    employeeId: string;

    @Column({ type: 'enum', enum: Gender })
    gender: Gender;

    @Column({ name: 'date_of_birth', type: 'date' })
    dateOfBirth: Date;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    qualification: string;

    @Column({ name: 'specialization', nullable: true })
    specialization: string;

    @Column({ name: 'joining_date', type: 'date', default: () => 'CURRENT_DATE' })
    joiningDate: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    salary: number;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @OneToOne(() => User, (user) => user.teacher, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToMany(() => Subject, (subject) => subject.teachers)
    @JoinTable({
        name: 'teacher_subjects',
        joinColumn: { name: 'teacher_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
    })
    subjects: Subject[];

    @OneToMany(() => Class, (classEntity) => classEntity.classTeacher)
    classesAsTeacher: Class[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
