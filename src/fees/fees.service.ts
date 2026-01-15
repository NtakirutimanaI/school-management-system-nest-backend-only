import { Injectable } from '@nestjs/common';
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
import { FeesQueryService } from './fees.query.service';

@Injectable()
export class FeesService {
  constructor(
    @InjectRepository(Fee) private readonly feeRepo: Repository<Fee>,
    @InjectRepository(Payment) private readonly payRepo: Repository<Payment>,
    private readonly query: FeesQueryService,
  ) { }

  async createFee(dto: CreateFeeDto) { return this.feeRepo.save(this.feeRepo.create(dto)); }
  async findAllFees() { return this.feeRepo.find({ relations: ['class'] }); }
  async updateFee(id: string, dto: UpdateFeeDto) {
    const f = await this.query.findOneFee(id);
    return this.feeRepo.save(Object.assign(f, dto));
  }
  async removeFee(id: string) { await this.feeRepo.remove(await this.query.findOneFee(id)); }

  async createPayment(dto: CreatePaymentDto) {
    const receipt = `RCP-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`;
    return this.payRepo.save(this.payRepo.create({ ...dto, receiptNumber: receipt, status: PaymentStatus.COMPLETED }));
  }
  async findAllPayments() { return this.payRepo.find({ relations: ['student', 'student.user', 'fee'] }); }
  async updatePayment(id: string, dto: UpdatePaymentDto) {
    const p = await this.query.findOnePayment(id);
    return this.payRepo.save(Object.assign(p, dto));
  }
}
