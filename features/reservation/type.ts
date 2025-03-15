export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Reservation {
  customerName: string;
  customerPhone: string;
  reservationTime: string | null;
  checkIn: string;
  tableIds: number[];
  numberOfPeople: number;
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
