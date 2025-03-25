// types.ts

export interface OrderItem {
    orderId: number;
    menuItemId: number;
    quantity: number;
    statusLabel: string; 
    createdAt: string; 
    updatedAt: string | null;
  }
  
  export interface Order {
    reservationId: number;
    staffId: number;
    statusLabel: string; 
    createdAt: string; 
    updatedAt: string | null;
    orderItems: OrderItem[];
  }
  
  export interface OrderResponse {
    data: Order[];
    message: string; 
    httpStatus: number; 
    timestamp: string; 
    error: string | null;
  }
  export interface OrderResponseId {
    data: Order;
    message: string; 
    httpStatus: number; 
    timestamp: string; 
    error: string | null;
  }
  // types.ts

export interface OrderItem {
  orderId: number;
  menuItemId: number;
  quantity: number;
  statusLabel: string; 
  createdAt: string; 
  updatedAt: string | null;
}


export interface CreateOrderItemRequest {
  menuItemId: number;
  quantity: number;
}

export interface CreateOrderItemResponse {
  data: OrderItem;
  message: string; // "success"
  httpStatus: number; // 200
  timestamp: string; // "Wed Mar 19 14:25:07 ICT 2025"
  error: string | null;
}