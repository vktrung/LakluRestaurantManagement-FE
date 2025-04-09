// Định nghĩa các kiểu dữ liệu cho table-order API

// Request để tạo table order mới
export interface CreateTableOrderRequest {
  customerName?: string;
  customerPhone?: string;
  tableIds: number[];
  numberOfPeople: number;
  orderItems: Array<{
    menuItemId: number;
    quantity: number;
  }>;
  note?: string;
}

// Response từ API khi tạo table order
export interface CreateTableOrderResponse {
  orderId: number;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}
