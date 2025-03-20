//features/payment/types.ts
export type PaymentMethod = "CASH" | "TRANSFER"
export type PaymentStatus = "PENDING" | "PAID"
export type DiscountType = "PERCENTAGE" | "FIXEDAMOUNT";
export type VoucherStatus = "ACTIVE" | "INACTIVE";

export interface OrderItem{
    dishName: string
    quantity: number
    price: string
}

export interface Payment {
    paymentId: number
    orderId: number
    amountPaid: string
    receivedAmount: string
    vat: string
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus
    code: string
    paymentDate: string
    createdAt: string
    updatedAt: string
}

export interface PaymentRequest {
    orderId: number
    paymentMethod: PaymentMethod
    voucher?: string
    vat?: number
}

export interface PaymentResponse {
    paymentId: number
    orderId: number
    amountPaid: string
    vat: string
    receivedAmount: string | null
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus
    paymentDate: string
    orderItems: OrderItem[]
}

export interface CashResponse{
    orderId: number
    amountPaid: string
    vat: string
    receivedAmount: string
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus
    paymentDate: string
    change: string
}

export interface ApiResponse<T>{
    data: T | null
    message: string
    httpStatus: number;
    timestamp: string;
    error: null | string;
}

export interface QrCodeResponse {
    qrCodeUrl: string
}

export interface SepayWebhookRequest{
    code: string
    transferAmount: number
}
