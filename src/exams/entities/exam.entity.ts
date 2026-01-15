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
import { ExamStatus, ExamType } from '../../common/enums/exam-status.enum';
import { Subject } from '../../subjects/entities/subject.entity';
import { Class } from '../../classes/entities/class.entity';
import { Result } from '../../results/entities/result.entity';

@Entity('exams')
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ExamType,
    default: ExamType.MIDTERM,
  })
  type: ExamType;

  @Column({ name: 'exam_date', type: 'date' })
  examDate: Date;

  @Column({ name: 'start_time', type: 'time', nullable: true })
  startTime: string;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime: string;

  @Column({ name: 'total_marks', type: 'int', default: 100 })
  totalMarks: number;

  @Column({ name: 'passing_marks', type: 'int', default: 40 })
  passingMarks: number;

  @Column({ name: 'academic_year' })
  academicYear: string;

  @Column({
    type: 'enum',
    enum: ExamStatus,
    default: ExamStatus.SCHEDULED,
  })
  status: ExamStatus;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Subject, (subject) => subject.exams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ name: 'subject_id' })
  subjectId: string;

  @ManyToOne(() => Class, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column({ name: 'class_id' })
  classId: string;

  @OneToMany(() => Result, (result) => result.exam)
  results: Result[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
