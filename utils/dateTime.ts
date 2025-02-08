import moment from 'moment';

export function parseDuration(duration: string) {
  if (!duration || duration.length < 2) return 0; // Trả về 0 nếu chuỗi không hợp lệ

  const unit = duration[duration.length - 1]; // Lấy ký tự cuối cùng (h, d, m, s)
  const value = parseInt(duration.slice(0, -1), 10); // Lấy giá trị số

  if (isNaN(value) || value < 0) return 0; // Nếu giá trị không phải số hoặc âm, trả về 0

  switch (unit) {
    case 'h':
      return value * 60 * 60; // Giờ -> giây
    case 'd':
      return value * 24 * 60 * 60; // Ngày -> giây
    case 'm':
      return value * 60; // Phút -> giây
    case 's':
      return value; // Giây (không cần thay đổi)
    default:
      return 0; // Trả về 0 nếu đơn vị không hợp lệ
  }
}

export function formatDate(date: string) {
  return moment(date).format('MM/DD/YYYY');
}
