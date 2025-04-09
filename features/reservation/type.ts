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

export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
export interface PaginationResponse {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PagedData<T> {
  content: T[];
  pagination: Pagination;
}

// Base API Response interface
export interface BaseApiResponse<T> {
  data: T;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}
export interface PageResponse<T> {
  content: T[];
  pagination: PaginationResponse;
}

export interface GetReservationsResp {
  data: PageResponse<ReservationResponse>;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

// Tối ưu sử dụng generic type
export type GetReservationsResponse = BaseApiResponse<ReservationResponse[]>;
export type GetReservationByIdResponse = BaseApiResponse<ReservationResponse>;
export type GetReservationsByTimeRangeResponse = BaseApiResponse<PagedData<ReservationResponse>>;
export type SearchReservationsResponse = BaseApiResponse<PagedData<ReservationResponse>>;
export type FilterReservationsResponse = BaseApiResponse<PagedData<ReservationResponse>>;
export type MergeTableResponse = BaseApiResponse<ReservationResponse>;
export type RemoveTableResponse = BaseApiResponse<ReservationResponse>;
export type AddTableResponse = BaseApiResponse<ReservationResponse>;

export interface TableByDate {
  id: number;
  tableNumber: string;
  capacity: number;
  status: string;
  isAvailable: boolean;
}

export type GetTablesByDateResponse = BaseApiResponse<TableByDate[]>;

export type TimeRangeType = 'today' | 'yesterday' | 'week' | 'month';

// Tham số cho API
export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface GetReservationsByTimeRangeParams extends PaginationParams {
  timeRange: TimeRangeType;
}

export interface SearchReservationsParams extends PaginationParams {
  keyword: string;
}

export interface FilterReservationsParams extends PaginationParams {
  date: string; // định dạng 'yyyy-MM-dd'
  status?: ReservationStatus;
}

export type MergeTableAction = 'MERGE' | 'SPLIT';

export interface MergeTableRequest {
  reservationId: number;
  tableIds: number[];
  numberOfPeople: number;
}

// Interfaces cho API xóa bàn khỏi đặt bàn
export interface RemoveTableRequest {
  tableIds: number[];
}

// Interfaces cho API thêm bàn vào đặt bàn
export interface AddTableRequest {
  tableIds: number[];
}
