export interface ITable {
  id: number;
  tableNumber: string;
  capacity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGetTablesResponse {
  data: ITable[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

export interface IAddTableRequest {
  tableNumber: string;
  capacity: number;
}

export interface IUpdateTableRequest {
  id: number;
  tableNumber?: string;
  capacity?: number;
  // Nếu cần update thêm các trường khác, có thể thêm vào đây
  status?: string;
}

export interface IDeleteTableRequest {
  id: number;
}