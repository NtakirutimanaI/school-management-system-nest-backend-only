import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Book } from './book.entity';
import { Student } from '../../students/entities/student.entity';

export enum BorrowStatus {
    BORROWED = 'BORROWED',
    RETURNED = 'RETURNED',
    OVERDUE = 'OVERDUE',
}

@Entity('borrowing_records')
export class BorrowingRecord {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({ name: 'book_id' })
    bookId: string;

    @ManyToOne(() => Book)
    @JoinColumn({ name: 'book_id' })
    book: Book;

    @ApiProperty()
    @Column({ name: 'student_id' })
    studentId: string;

    @ManyToOne(() => Student)
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @ApiProperty()
    @Column({ type: 'date', name: 'borrow_date' })
    borrowDate: Date;

    @ApiProperty()
    @Column({ type: 'date', name: 'due_date' })
    dueDate: Date;

    @ApiProperty({ required: false })
    @Column({ type: 'date', name: 'return_date', nullable: true })
    returnDate: Date;

    @ApiProperty({ enum: BorrowStatus })
    @Column({ type: 'enum', enum: BorrowStatus, default: BorrowStatus.BORROWED })
    status: BorrowStatus;

    @ApiProperty({ required: false })
    @Column({ name: 'fine_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    fineAmount: number;

    @ApiProperty()
    @Column({ name: 'school_id', nullable: true })
    schoolId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
