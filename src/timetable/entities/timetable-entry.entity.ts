import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Class } from '../../classes/entities/class.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

export enum DayOfWeek {
    MONDAY = 'Monday',
    TUESDAY = 'Tuesday',
    WEDNESDAY = 'Wednesday',
    THURSDAY = 'Thursday',
    FRIDAY = 'Friday',
    SATURDAY = 'Saturday',
    SUNDAY = 'Sunday',
}

@Entity('timetables')
export class TimetableEntry {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ enum: DayOfWeek })
    @Column({ type: 'enum', enum: DayOfWeek })
    dayOfWeek: DayOfWeek;

    @ApiProperty({ example: '08:00' })
    @Column({ type: 'time' })
    startTime: string;

    @ApiProperty({ example: '09:00' })
    @Column({ type: 'time' })
    endTime: string;

    @ApiProperty()
    @Column({ name: 'class_id' })
    classId: string;

    @ManyToOne(() => Class)
    @JoinColumn({ name: 'class_id' })
    class: Class;

    @ApiProperty()
    @Column({ name: 'subject_id' })
    subjectId: string;

    @ManyToOne(() => Subject)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @ApiProperty({ required: false })
    @Column({ name: 'teacher_id', nullable: true })
    teacherId: string;

    @ManyToOne(() => Teacher)
    @JoinColumn({ name: 'teacher_id' })
    teacher: Teacher;

    @ApiProperty({ required: false })
    @Column({ name: 'room_id', nullable: true })
    roomId: string;

    @ApiProperty({ required: false })
    @Column({ name: 'school_id', nullable: true })
    schoolId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
