import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee } from './entities/fee.entity';
import { Payment } from './entities/payment.entity';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FeesService {
    constructor(
        @InjectRepository(Fee)
        private readonly feeRepository: Repository<Fee>,
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
    ) { }

    // Fee operations
    async createFee(createFeeDto: CreateFeeDto): Promise<Fee> {
        const fee = this.feeRepository.create(createFeeDto);
        return this.feeRepository.save(fee);
    }

    async findAllFees(): Promise<Fee[]> {
        return this.feeRepository.find({ relations: ['class'] });
    }

    async findOneFee(id: string): Promise<Fee> {
        const fee = await this.feeRepository.findOne({
            where: { id },
            relations: ['class', 'payments', 'payments.student'],
        });
        if (!fee) {
            throw new NotFoundException(`Fee with ID ${id} not found`);
        }
        return fee;
    }

    async updateFee(id: string, updateFeeDto: UpdateFeeDto): Promise<Fee> {
        const fee = await this.findOneFee(id);
        Object.assign(fee, updateFeeDto);
        return this.feeRepository.save(fee);
    }

    async removeFee(id: string): Promise<void> {
        const fee = await this.findOneFee(id);
        await this.feeRepository.remove(fee);
    }

    // Payment operations
    async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
        const receiptNumber = `RCP-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`;
        const payment = this.paymentRepository.create({
            ...createPaymentDto,
            receiptNumber,
            status: PaymentStatus.COMPLETED,
        });
        return this.paymentRepository.save(payment);
    }

    async findAllPayments(): Promise<Payment[]> {
        return this.paymentRepository.find({ relations: ['student', 'student.user', 'fee'] });
    }

    async findOnePayment(id: string): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: ['student', 'student.user', 'fee'],
        });
        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
    }

    async findPaymentsByStudent(studentId: string): Promise<Payment[]> {
        return this.paymentRepository.find({
            where: { studentId },
            relations: ['fee'],
        });
    }

    async updatePayment(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
        const payment = await this.findOnePayment(id);
        Object.assign(payment, updatePaymentDto);
        return this.paymentRepository.save(payment);
    }

    async getStudentFeeStatus(studentId: string, academicYear: string) {
        const fees = await this.feeRepository.find({ where: { academicYear } });
        const payments = await this.paymentRepository.find({ where: { studentId } });

        return fees.map((fee) => {
            const feePayments = payments.filter((p) => p.feeId === fee.id);
            const totalPaid = feePayments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
            return { fee, totalPaid, balance: Number(fee.amount) - totalPaid, isPaid: totalPaid >= Number(fee.amount) };
        });
    }
}
