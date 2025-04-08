// types.ts

export type OrderItemStatus = 'PENDING' | 'DOING' | 'COMPLETED' | 'CANCELLED' | 'DELIVERED';
export const statusLabelToEnum: Record<string, OrderItemStatus> = {
  'Đang chờ': 'PENDING',
  'Đang xử lý': 'DOING',
  'Đang làm': 'DOING', // Add this to handle the API's statusLabel
  'Đã hoàn thành': 'COMPLETED',
  'Đã hủy': 'CANCELLED',
  'Đã giao': 'DELIVERED',
};

export const enumToStatusLabel: Record<OrderItemStatus, string> = {
  PENDING: 'Đang chờ',
  DOING: 'Đang xử lý', // Keep this as the canonical label for display
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
  DELIVERED: 'Đã giao',
};
export interface Table {
  id: number;
  tableNumber: string;
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  menuItemId: number;
  dish: {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string | null;
    price: number;
    requiresPreparation: boolean;
    images: any[] | null;
  } | null;
  quantity: number;
  statusLabel: string;
  createdAt: string;
  updatedAt: string | null;
}
  
export interface Order {
  id: number;
  reservationId: number;
  staffId: number;
  statusLabel: string; 
  createdAt: string; 
  updatedAt: string | null;
  orderItems: OrderItem[];
  tables: Table[];
  staff?: any; // Sẽ được điền sau khi lấy dữ liệu từ user me
}
  
export interface OrderResponse {
  data: Order[];
  message?: string;
  httpStatus?: number;
}

export interface OrderResponseId {
  data: Order;
  message: string; 
  httpStatus: number; 
  timestamp: string; 
  error: string | null;
}

export interface CreateOrderItemRequest {
  menuItemId: number;
  quantity: number;
}

export interface GetOrdersParams {
  date?: string;
  status?: string; 
  sort?: string; 
}

export interface GetOrdersParamsEveningToDawn {
  date?: string;

}

export interface CreateOrderItemResponse {
  data: OrderItem;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export interface UpdateOrderItemStatusRequest {
  status: OrderItemStatus;
}

// Menu Item Types
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  status: string;
  categoryId: number;
}
export interface BatchUpdateOrderItemStatusRequest {
  status: OrderItemStatus;
  orderItemIds: number[];
}
export interface BatchUpdateOrderItemStatusResponse {
  data: OrderItem[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}
export interface OrderItemResponse {
  data: OrderItem;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
}