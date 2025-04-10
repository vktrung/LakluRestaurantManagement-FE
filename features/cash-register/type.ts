export interface CashRegisterStartAmountRequest {
  amount: number;
  notes?: string;
}

export interface CashRegisterEndAmountRequest {
  amount: number;
  notes?: string;
}

export interface CashRegisterWithdrawRequest {
  amount: number;
  notes?: string;
}

export interface CashRegisterHistory {
  id: number;
  userId: number;
  userFullName: string;
  scheduleId: number;
  initialAmount: number;
  currentAmount: number;
  shiftStart: string;
  shiftEnd: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  id: number;
  orderId: number;
  orderCode: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  cashierId: number;
  cashierName: string;
}

export interface PageableResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

export interface CashRegisterResponse {
  data: CashRegisterHistory;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

export type CashRegisterHistoryResponse = ApiResponse<PageableResponse<CashRegisterHistory>>;
export type PaymentHistoryResponse = ApiResponse<PageableResponse<PaymentHistory>>;
