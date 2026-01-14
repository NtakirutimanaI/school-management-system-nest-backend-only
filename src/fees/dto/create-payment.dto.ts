import {
    IsString,
    IsNumber,
    IsOptional,
    IsDateString,
    IsEnum,
    IsUUID,
    Min,
} from 'class-validator';
import { PaymentMethod } from '../../common/enums/payment-status.enum';

export class CreatePaymentDto {
    @IsUUID()
    studentId: string;

    @IsUUID()
    feeId: string;

    @IsNumber()
    @Min(0)
    amountPaid: number;

    @IsDateString()
    @IsOptional()
    paymentDate?: string;

    @IsEnum(PaymentMethod)
    @IsOptional()
    method?: PaymentMethod;

    @IsString()
    @IsOptional()
    transactionId?: string;

    @IsString()
    @IsOptional()
    remarks?: string;
}
