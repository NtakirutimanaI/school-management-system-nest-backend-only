import { IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IssueBookDto {
    @ApiProperty()
    @IsUUID()
    bookId: string;

    @ApiProperty()
    @IsUUID()
    studentId: string;

    @ApiProperty()
    @IsDateString()
    dueDate: string;
}
