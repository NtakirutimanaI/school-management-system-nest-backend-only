import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeesService } from './fees.service';
import { FeesController } from './fees.controller';
import { Fee } from './entities/fee.entity';
import { Payment } from './entities/payment.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Fee, Payment])],
    controllers: [FeesController],
    providers: [FeesService],
    exports: [FeesService],
})
export class FeesModule { }
