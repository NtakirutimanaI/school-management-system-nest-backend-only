import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Gender } from '../../common/enums/gender.enum';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Result } from '../../results/entities/result.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'admission_number', unique: true })
  admissionNumber: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: Date;

  @Column({ nullable: true })
  address: string;

  @Column({ name: 'parent_name', nullable: true })
  parentName: string;

  @Column({ name: 'parent_phone', nullable: true })
  parentPhone: string;

  @Column({ name: 'parent_email', nullable: true })
  parentEmail: string;

  @Column({ name: 'emergency_contact', nullable: true })
  emergencyContact: string;

  @Column({ name: 'blood_group', nullable: true })
  bloodGroup: string;

  @Column({
    name: 'admission_date',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  admissionDate: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'profile_picture_url', nullable: true })
  profilePictureUrl: string;

  @OneToOne(() => User, (user) => user.student, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Class, (classEntity) => classEntity.students)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column({ name: 'class_id', nullable: true })
  classId: string;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments: Enrollment[];

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendanceRecords: Attendance[];

  @OneToMany(() => Result, (result) => result.student)
  results: Result[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
