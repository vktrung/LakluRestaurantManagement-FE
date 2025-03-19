
export type PaymentMethod = "CASH" | "TRANSFER"
export type PaymentStatus = "PENDING" | "PAID"
export type DiscountType = "PERCENTAGE" | "FIXEDAMOUNT";
export type VoucherStatus = "ACTIVE" | "INACTIVE";

export interface OrderItem{
    dishName: string
    quantity: number
    price: number
}

export interface Payment {
    id: number
    orderId: number
    amountPaid: number
    receivedAmount: number
    vat: number
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
    amountPaid: number
    receivedAmount: number | null
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus
    paymentDate: string
    orderItems: OrderItem[]
}

export interface CashResponse{
    orderId: number
    amountPaid: number
    receivedAmount: number
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus
    paymentDate: string
    change: number
}

export interface ApiResponse<T>{
    data: T
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
