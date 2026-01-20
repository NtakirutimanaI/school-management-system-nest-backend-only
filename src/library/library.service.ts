import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { BorrowingRecord, BorrowStatus } from './entities/borrowing-record.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { IssueBookDto } from './dto/issue-book.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class LibraryService {
    constructor(
        @InjectRepository(Book) private bookRepo: Repository<Book>,
        @InjectRepository(BorrowingRecord) private recordRepo: Repository<BorrowingRecord>,
        @Inject(REQUEST) private request: Request,
    ) { }

    private getSchoolId(): string {
        return (this.request as any).schoolId;
    }

    async addBook(dto: CreateBookDto) {
        const schoolId = this.getSchoolId();
        const book = this.bookRepo.create({ ...dto, available: dto.quantity, schoolId });
        return this.bookRepo.save(book);
    }

    async findAllBooks(search?: string) {
        const schoolId = this.getSchoolId();
        const query = this.bookRepo.createQueryBuilder('book')
            .where('book.schoolId = :schoolId', { schoolId });

        if (search) {
            query.andWhere('(book.title ILIKE :search OR book.author ILIKE :search)', { search: `%${search}%` });
        }
        return query.getMany();
    }

    async issueBook(dto: IssueBookDto) {
        const schoolId = this.getSchoolId();
        const book = await this.bookRepo.findOne({ where: { id: dto.bookId, schoolId } });
        if (!book) throw new NotFoundException('Book not found');
        if (book.available < 1) throw new BadRequestException('Book not available');

        // Create record
        const record = this.recordRepo.create({
            bookId: dto.bookId,
            studentId: dto.studentId,
            dueDate: new Date(dto.dueDate),
            borrowDate: new Date(),
            status: BorrowStatus.BORROWED,
            schoolId,
        });

        await this.recordRepo.save(record);

        // Decrement availability
        book.available -= 1;
        await this.bookRepo.save(book);

        return record;
    }

    async returnBook(recordId: string) {
        const schoolId = this.getSchoolId();
        const record = await this.recordRepo.findOne({ where: { id: recordId, schoolId }, relations: ['book'] });
        if (!record) throw new NotFoundException('Record not found');
        if (record.status === BorrowStatus.RETURNED) throw new BadRequestException('Already returned');

        record.returnDate = new Date();
        record.status = BorrowStatus.RETURNED;

        // Calc fine
        const now = new Date();
        if (now > record.dueDate) {
            const diffDays = Math.ceil((now.getTime() - record.dueDate.getTime()) / (1000 * 3600 * 24));
            record.fineAmount = diffDays * 1.0; // $1 per day
            record.status = BorrowStatus.OVERDUE // Or separate status? Enum has OVERDUE but technically it IS returned now.
            // Let's keep RETURNED but note fine.
            // Or update status to RETURNED_WITH_FINE? For simplicity: RETURNED.
        }

        await this.recordRepo.save(record);

        // Increment availability
        const book = await this.bookRepo.findOne({ where: { id: record.bookId } });
        if (book) {
            book.available += 1;
            await this.bookRepo.save(book);
        }

        return record;
    }

    async getMyRecords(studentId: string) {
        const schoolId = this.getSchoolId();
        return this.recordRepo.find({
            where: { studentId, schoolId },
            relations: ['book'],
            order: { borrowDate: 'DESC' }
        });
    }

    async getAllRecords() {
        const schoolId = this.getSchoolId();
        return this.recordRepo.find({ where: { schoolId }, relations: ['book', 'student', 'student.user'], order: { borrowDate: 'DESC' } });
    }
}
