import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Student } from '../../students/entities/student.entity';

export enum DisciplineType {
    INFRACTION = 'INFRACTION',
    MERIT = 'MERIT',
}

export enum DisciplineSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export enum DisciplineStatus {
    PENDING = 'PENDING',
    RESOLVED = 'RESOLVED',
    ESCALATED = 'ESCALATED',
}

@Entity('discipline_records')
export class DisciplineRecord {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ enum: DisciplineType })
    @Column({ type: 'enum', enum: DisciplineType, default: DisciplineType.INFRACTION })
    type: DisciplineType;

    @ApiProperty()
    @Column()
    description: string;

    @ApiProperty({ enum: DisciplineSeverity })
    @Column({ type: 'enum', enum: DisciplineSeverity, default: DisciplineSeverity.LOW })
    severity: DisciplineSeverity;

    @ApiProperty({ required: false })
    @Column({ nullable: true })
    actionTaken: string;

    @ApiProperty({ enum: DisciplineStatus })
    @Column({ type: 'enum', enum: DisciplineStatus, default: DisciplineStatus.PENDING })
    status: DisciplineStatus;

    @ApiProperty()
    @Column({ type: 'date' })
    date: Date;

    @ApiProperty()
    @Column({ name: 'student_id' })
    studentId: string;

    @ManyToOne(() => Student)
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @ApiProperty()
    @Column({ name: 'school_id', nullable: true })
    schoolId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
