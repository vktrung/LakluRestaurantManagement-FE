//features/payment/types.ts
export type PaymentMethod = "CASH" | "TRANSFER"
export type PaymentStatus = "PENDING" | "PAID" | "FAILED"
export type DiscountType = "PERCENTAGE" | "FIXEDAMOUNT";
export type VoucherStatus = "ACTIVE" | "INACTIVE";

export interface OrderItem{
    id?: number // OrderItem ID from backend
    orderItemId?: number // Alternative ID field
    dishName: string
    quantity: number
    price: string
    orderId?: number
    menuItemId?: number
}

// Response cho từng món trong bill
export interface OrderItemsResponse {
    id: number
    dishName: string
    quantity: number
    price: number
}

// Response cho bill
export interface BillResponse {
    orderId: number
    tableNumber: string
    date: string
    timeIn: string
    timeOut: string
    orderItems: OrderItemsResponse[]
    totalAmount: number
    receivedAmount: number
    change: number
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
    voucherCode?: string
    vat?: number
}

export interface PaymentResponse {
    paymentId: number
    orderId: number
    amountPaid: string | number
    receivedAmount: string | number | null
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus
    paymentDate: string
    vat: string | number
    orderItems: OrderItem[]
}

export interface PaginatedPaymentResponse {
    payments: PaymentResponse[]
    currentPage: number
    totalItems: number
    totalPages: number
    sortBy: string
    sortDirection: string
}

export interface PaymentListParams {
    page?: number
    pageSize?: number
    startDate?: string
    endDate?: string
    sortBy?: string
    sortDirection?: string
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

export interface UpdateOrderItemQuantity {
    quantity: number
}

export interface UpdateOrderItemResponse {
    id: number
    orderId: number
    menuItemId: number
    quantity: number
    statusLabel: string
    createdAt: string
    updatedAt: string
}

export interface CreateOrderItemRequest {
    orderId: number
    menuItemId: number
    quantity: number
}
