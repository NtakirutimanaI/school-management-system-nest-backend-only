import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

export class UpdatePaymentDto extends PartialType(
    OmitType(CreatePaymentDto, ['studentId', 'feeId'] as const),
) {
    @IsEnum(PaymentStatus)
    @IsOptional()
    status?: PaymentStatus;
}
