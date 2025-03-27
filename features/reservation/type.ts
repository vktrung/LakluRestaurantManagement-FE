export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Reservation {
  customerName: string;
  customerPhone: string;
  reservationTime: string | null;
  checkIn: string;
  tableIds: number[];
  numberOfPeople: number;
}

export interface TableInfo {
  id: number;
  tableNumber: string;
}

export interface ReservationDetail {
  id: number;
  customerName: string;
  customerPhone: string;
  reservationTime: string | null;
  status: ReservationStatus;
  createBy: string;
  numberOfPeople: number;
  checkIn: string;
  checkOut: string | null;
  tableName?: string[];
  tableIds?: number[];
  tables?: TableInfo[];
  timeOut: string | null;
  timeIn: string;
}

export interface ReservationResponse {
  id: number;
  timeIn: string;
  timeOut: string | null;
  detail: ReservationDetail;
}

export interface GetReservationsResponse {
  data: ReservationResponse[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

export interface GetReservationByIdResponse {
  data: ReservationResponse;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

export interface TableByDate {
  id: number;
  tableNumber: string;
  capacity: number;
  status: string;
  isAvailable: boolean;
}

export interface GetTablesByDateResponse {
  data: TableByDate[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

export type MergeTableAction = 'MERGE' | 'SPLIT';

export interface MergeTableRequest {
  reservationId: number;
  tableIds: number[];
  numberOfPeople: number;
}

export interface MergeTableResponse {
  data: {
    id: number;
    timeIn: string;
    timeOut: string | null;
    detail: ReservationDetail;
  };
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

// Interfaces cho API xóa bàn khỏi đặt bàn
export interface RemoveTableRequest {
  tableIds: number[];
}

export interface RemoveTableResponse {
  data: ReservationResponse;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

// Interfaces cho API thêm bàn vào đặt bàn
export interface AddTableRequest {
  tableIds: number[];
}

export interface AddTableResponse {
  data: ReservationResponse;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}
