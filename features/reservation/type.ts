// Các trạng thái đặt chỗ
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' ;

// Kiểu đặt chỗ dùng khi tạo mới (POST)
// Lưu ý: field id là optional vì nó thường do backend tạo
export interface Reservation {
  id?: number;
  customerName: string;
  customerPhone: string;
  reservationTime: string; // ISO string, ví dụ: "2025-03-10T17:23:04.619Z"
  checkIn: string;         // ISO string
  tableIds: number[];
  numberOfPeople: number;
  status: ReservationStatus; // Khi tạo mới, bạn có thể gán mặc định là "pending" hoặc "confirmed" tùy theo nghiệp vụ
}

// Kiểu dùng cho request update (PUT)
// Các field là optional để hỗ trợ cập nhật từng phần
export interface UpdateReservationRequest {
  id: number;
  customerName?: string;
  customerPhone?: string;
  reservationTime?: string;
  checkIn?: string;
  tableIds?: number[];
  numberOfPeople?: number;
  status?: ReservationStatus;
}

// Kiểu chi tiết đặt chỗ (GET response)
export interface ReservationDetail {
  id: number;
  customerName: string;
  customerPhone: string;
  reservationTime: string | null;
  status: ReservationStatus;
  createdBy: string;
  numberOfPeople: number;
  checkIn: string;
  checkOut: string | null;
  tableName: string[];   // Danh sách tên bàn
  timeIn: string;
  timeOut: string | null;
}

// Kiểu cho từng mục đặt chỗ trong mảng dữ liệu
export interface ReservationEntry {
  id: number;
  timeIn: string;
  timeOut: string | null;
  detail: ReservationDetail;
}

// Kiểu cho response trả về từ API GET đặt chỗ
export interface GetReservationResponse {
  data: ReservationEntry[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: any;
}
