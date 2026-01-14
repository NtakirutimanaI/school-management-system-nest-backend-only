export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    PARTIAL = 'partial',
}

export enum PaymentMethod {
    CASH = 'cash',
    BANK_TRANSFER = 'bank_transfer',
    MOBILE_MONEY = 'mobile_money',
    CARD = 'card',
    CHECK = 'check',
}
