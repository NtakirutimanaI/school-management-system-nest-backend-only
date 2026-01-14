import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { PaymentStatus, PaymentMethod } from '../../common/enums/payment-status.enum';
import { Student } from '../../students/entities/student.entity';
import { Fee } from './fee.entity';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2 })
    amountPaid: number;

    @Column({ name: 'payment_date', type: 'date', default: () => 'CURRENT_DATE' })
    paymentDate: Date;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.CASH,
    })
    method: PaymentMethod;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.COMPLETED,
    })
    status: PaymentStatus;

    @Column({ name: 'transaction_id', nullable: true })
    transactionId: string;

    @Column({ name: 'receipt_number', unique: true })
    receiptNumber: string;

    @Column({ nullable: true })
    remarks: string;

    @ManyToOne(() => Student, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @Column({ name: 'student_id' })
    studentId: string;

    @ManyToOne(() => Fee, (fee) => fee.payments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'fee_id' })
    fee: Fee;

    @Column({ name: 'fee_id' })
    feeId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
