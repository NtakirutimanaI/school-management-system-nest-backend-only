import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { Class } from '../../classes/entities/class.entity';

export enum MaterialType {
    LESSON_PLAN = 'LESSON_PLAN',
    SCHEME_OF_WORK = 'SCHEME_OF_WORK',
    NOTE = 'NOTE',
    ASSIGNMENT = 'ASSIGNMENT',
}

@Entity('materials')
export class Material {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    title: string;

    @ApiProperty({ required: false })
    @Column({ nullable: true })
    description: string;

    @ApiProperty({ enum: MaterialType })
    @Column({ type: 'enum', enum: MaterialType })
    type: MaterialType;

    @ApiProperty()
    @Column({ name: 'file_url' })
    fileUrl: string;

    @ApiProperty()
    @Column({ name: 'teacher_id' })
    teacherId: string;

    @ManyToOne(() => Teacher)
    @JoinColumn({ name: 'teacher_id' })
    teacher: Teacher;

    @ApiProperty({ required: false })
    @Column({ name: 'subject_id', nullable: true })
    subjectId: string;

    @ManyToOne(() => Subject)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @ApiProperty({ required: false })
    @Column({ name: 'class_id', nullable: true })
    classId: string;

    @ManyToOne(() => Class)
    @JoinColumn({ name: 'class_id' })
    class: Class;

    @ApiProperty()
    @Column({ name: 'school_id', nullable: true })
    schoolId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
