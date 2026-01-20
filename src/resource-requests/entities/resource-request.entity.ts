import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Teacher } from '../../teachers/entities/teacher.entity';

export enum ResourceRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    FULFILLED = 'FULFILLED',
}

@Entity('resource_requests')
export class ResourceRequest {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    item: string;

    @ApiProperty({ required: false })
    @Column({ nullable: true })
    description: string;

    @ApiProperty()
    @Column({ default: 1 })
    quantity: number;

    @ApiProperty({ enum: ResourceRequestStatus })
    @Column({ type: 'enum', enum: ResourceRequestStatus, default: ResourceRequestStatus.PENDING })
    status: ResourceRequestStatus;

    @ApiProperty({ required: false })
    @Column({ name: 'admin_comment', nullable: true })
    adminComment: string;

    @ApiProperty()
    @Column({ name: 'teacher_id' })
    teacherId: string;

    @ManyToOne(() => Teacher)
    @JoinColumn({ name: 'teacher_id' })
    teacher: Teacher;

    @ApiProperty()
    @Column({ name: 'school_id', nullable: true })
    schoolId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
