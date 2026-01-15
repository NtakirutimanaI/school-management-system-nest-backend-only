
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee } from './entities/fee.entity';
import { Payment } from './entities/payment.entity';

@Injectable()
export class FeesQueryService {
    constructor(
        @InjectRepository(Fee) private readonly feeRepo: Repository<Fee>,
        @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    ) { }

    async findOneFee(id: string) {
        const f = await this.feeRepo.findOne({ where: { id }, relations: ['class', 'payments', 'payments.student'] });
        if (!f) throw new NotFoundException(`Fee ${id} not found`);
        return f;
    }

    async findOnePayment(id: string) {
        const p = await this.paymentRepo.findOne({ where: { id }, relations: ['student', 'student.user', 'fee'] });
        if (!p) throw new NotFoundException(`Payment ${id} not found`);
        return p;
    }

    async getStudentStatus(studentId: string, academicYear: string) {
        const [fees, payments] = await Promise.all([
            this.feeRepo.find({ where: { academicYear } }),
            this.paymentRepo.find({ where: { studentId } })
        ]);
        return fees.map(f => {
            const paid = payments.filter(p => p.feeId === f.id).reduce((s, p) => s + Number(p.amountPaid), 0);
            return { fee: f, paid, balance: Number(f.amount) - paid, isPaid: paid >= Number(f.amount) };
        });
    }
}
