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
  paymentId: number;
  paymentType: "IN" | "OUT";
  transferType: "CASH" | "BANKING";
  transactionDate: string;
  amount: number;
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface Pageable {
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
}

export interface PageableResponse<T> {
  content: T[];
  pageable: Pageable;
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

export interface PaymentHistoryPageResponse {
  content: PaymentHistory[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

export interface CashRegisterResponse {
  data: CashRegisterHistory[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

export type CashRegisterHistoryResponse = ApiResponse<PageableResponse<CashRegisterHistory>>;
export type PaymentHistoryResponse = ApiResponse<PaymentHistoryPageResponse>;
