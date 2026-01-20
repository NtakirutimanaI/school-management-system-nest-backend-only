import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { TimetableEntry } from './entities/timetable-entry.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TimetableEntry])],
    controllers: [TimetableController],
    providers: [TimetableService],
})
export class TimetableModule { }
