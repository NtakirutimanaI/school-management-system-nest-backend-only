import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum EventType {
    TERM = 'term',
    EXAM = 'exam',
    HOLIDAY = 'holiday',
    EVENT = 'event',
}

@Entity('school_events')
export class SchoolEvent {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    title: string;

    @ApiProperty({ required: false })
    @Column({ nullable: true })
    description: string;

    @ApiProperty()
    @Column({ type: 'timestamp' })
    startDate: Date;

    @ApiProperty()
    @Column({ type: 'timestamp' })
    endDate: Date;

    @ApiProperty({ enum: EventType })
    @Column({ type: 'enum', enum: EventType, default: EventType.EVENT })
    type: EventType;

    @ApiProperty({ required: false })
    @Column({ name: 'school_id', nullable: true })
    schoolId: string;

    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
