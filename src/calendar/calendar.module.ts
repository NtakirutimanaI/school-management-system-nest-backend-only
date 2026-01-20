import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { SchoolEvent } from './entities/school-event.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SchoolEvent])],
    controllers: [CalendarController],
    providers: [CalendarService],
})
export class CalendarModule { }
