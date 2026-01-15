import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Student } from '../../students/entities/student.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  section: string;

  @Column({ name: 'grade_level' })
  gradeLevel: number;

  @Column({ name: 'academic_year' })
  academicYear: string;

  @Column({ nullable: true })
  room: string;

  @Column({ type: 'int', default: 40 })
  capacity: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Teacher, (teacher) => teacher.classesAsTeacher)
  @JoinColumn({ name: 'class_teacher_id' })
  classTeacher: Teacher;

  @Column({ name: 'class_teacher_id', nullable: true })
  classTeacherId: string;

  @OneToMany(() => Student, (student) => student.class)
  students: Student[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.class)
  enrollments: Enrollment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
