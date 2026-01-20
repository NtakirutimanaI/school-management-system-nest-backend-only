import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('books')
export class Book {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    title: string;

    @ApiProperty()
    @Column()
    author: string;

    @ApiProperty({ required: false })
    @Column({ nullable: true })
    isbn: string;

    @ApiProperty()
    @Column({ default: 1 })
    quantity: number;

    @ApiProperty()
    @Column({ default: 1 })
    available: number;

    @ApiProperty({ required: false })
    @Column({ nullable: true })
    category: string;

    @ApiProperty()
    @Column({ name: 'school_id', nullable: true })
    schoolId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
