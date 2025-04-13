export interface OrderItemsResponse {
  orderItemId: number;
  dishName: string;
  quantity: number;
  price: number;
}

export interface BillResponse {
  orderId: number;
  tableNumber: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  orderItems: OrderItemsResponse[];
  totalAmount: number;
  receivedAmount: number;
  voucherValue: number;
  change: number;
}

export interface BillApiResponse {
  data: BillResponse;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
} 