// types.ts

export type OrderItemStatus = 'PENDING' | 'DOING' | 'COMPLETED' | 'CANCELLED';

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

export interface OrderItemResponse {
  data: OrderItem;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
}