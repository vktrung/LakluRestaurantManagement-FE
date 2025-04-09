// Định nghĩa các kiểu dữ liệu cho table-order API

// Request để tạo table order mới
export interface CreateTableOrderRequest {
  tableId: number;
  userId: number;
  status?: string;
  note?: string;
  // Thêm các trường khác nếu cần
}

// Response từ API khi tạo table order
export interface CreateTableOrderResponse {
  data: {
    id: number;
    tableId: number;
    userId: number;
    status: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}
