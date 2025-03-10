// Kiểu cho đặt chỗ khi tạo (POST)
export interface Reservation {
  customerName: string;
  customerPhone: string;
  reservationTime: string; // ISO string, ví dụ: "2025-03-09T14:14:07.391Z"
  checkIn: string;         // ISO string, ví dụ: "2025-03-09T14:14:07.391Z"
  tableIds: number[];
  numberOfPeople: number;
}

// Kiểu dữ liệu cho thông tin chi tiết của đặt chỗ (trong response GET)
export interface ReservationDetail {
  id: number;
  customerName: string;
  customerPhone: string;
  reservationTime: string | null;
  status: string;        // ví dụ: "PENDING"
  createBy: string;
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
