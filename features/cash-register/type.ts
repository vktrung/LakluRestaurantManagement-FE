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
  notes: string;
}

export interface CashRegisterInfo {
  id: number;
  userId: number;
  userName: string;
  scheduleId: number;
  initialAmount: number;
  currentAmount: number;
  shiftStart: string;
  shiftEnd: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface TransactionHistory {
  id: number;
  paymentId: number;
  paymentType: "IN" | "OUT";
  transferType: "CASH" | "BANKING";
  transactionDate: string;
  amount: number;
}

export interface TransactionHistoryResponse {
  data: {
    content: TransactionHistory[];
    pagination: Pagination;
  };
  message: string;
  httpStatus: number;
  timestamp: string;
  error: any;
}

export interface CashRegisterResponse {
  data: CashRegisterInfo[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: any;
}

export interface Transaction {
  id: number;
  date: Date;
  type: "opening" | "closing" | "withdrawal";
  amount: number;
  balance: number;
  description?: string;
}
