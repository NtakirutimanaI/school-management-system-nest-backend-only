import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryService } from './library.service';
import { LibraryController } from './library.controller';
import { Book } from './entities/book.entity';
import { BorrowingRecord } from './entities/borrowing-record.entity';
import { StudentsModule } from '../students/students.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Book, BorrowingRecord]),
        StudentsModule,
    ],
    controllers: [LibraryController],
    providers: [LibraryService],
})
export class LibraryModule { }
