import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum AnnouncementTarget {
    ALL = 'ALL',
    TEACHERS = 'TEACHERS',
    STUDENTS = 'STUDENTS',
    PARENTS = 'PARENTS',
}

@Entity('announcements')
export class Announcement {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    title: string;

    @ApiProperty()
    @Column('text')
    content: string;

    @ApiProperty({ enum: AnnouncementTarget })
    @Column({ type: 'enum', enum: AnnouncementTarget, default: AnnouncementTarget.ALL })
    target: AnnouncementTarget;

    @ApiProperty()
    @Column({ name: 'school_id', nullable: true })
    schoolId: string;

    @ApiProperty()
    @Column({ name: 'author_id' })
    authorId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'author_id' })
    author: User;

    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
