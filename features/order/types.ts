// types.ts
export interface Dish {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
  price: number;
  requiresPreparation: boolean;
  images: string | null;
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  menuItemId: number;
  dish: Dish;
  quantity: number;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  reservationId: number;
  staffId: number;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
  tableNumber: number | null;
  tableId: number | null;
  orderItems: OrderItem[];
}

export interface OrderResponse {
  data: Order[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
}

export interface UpdateOrderStatusRequest {
  statusLabel: string;
}

export interface UpdateOrderItemStatusRequest {
  statusLabel: string;
}

export interface CreateOrderItemRequest {
  menuItemId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  reservationId: number;
  // staffId: number;
  orderItems: CreateOrderItemRequest[];
}

export interface OrderItemSplitRequest {
  orderItemId: number;
  quantity: number;
}

export interface OrderSplitRequest {
  orderId: number;
  orderItems: OrderItemSplitRequest[];
}

export interface MergeOrderRequest {
  orderIds: number[];
  reservationId: number;
}

export interface AddOrderItemRequest {
  menuItemId: number;
  quantity: number;
}


