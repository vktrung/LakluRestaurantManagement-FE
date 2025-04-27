#!/bin/bash

# Script triển khai cho hệ thống Linux
echo "===== TRIỂN KHAI ỨNG DỤNG LAKLU RESTAURANT MANAGEMENT ====="
echo "Thời gian: $(date)"

# Kiểm tra môi trường Linux
if [ "$(uname)" != "Linux" ]; then
  echo "CẢNH BÁO: Script này được tối ưu hóa cho Linux. Bạn đang chạy trên $(uname)."
fi

# Thiết lập biến môi trường
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export NEXT_DISABLE_SOURCEMAPS=1
export NEXT_TYPESCRIPT_CHECK=0

# Hiển thị thông tin hệ thống
echo "===== THÔNG TIN HỆ THỐNG ====="
echo "- OS: $(uname -s)"
echo "- Kernel: $(uname -r)"
echo "- Node: $(node -v)"
echo "- NPM: $(npm -v)"

# Xóa các tiến trình Node.js hiện có
echo "===== DỌN DẸP TIẾN TRÌNH ====="
pkill -f "node" || true
sleep 1

# Thực hiện build minimal
echo "===== TIẾN HÀNH BUILD ====="
chmod +x minimal-build.sh
./minimal-build.sh || { echo "ERROR: Lỗi trong quá trình build"; exit 1; }

# Khởi động ứng dụng
echo "===== KHỞI ĐỘNG ỨNG DỤNG ====="

# Kiểm tra xem PM2 có được cài đặt không
if command -v pm2 >/dev/null 2>&1; then
  echo "- Sử dụng PM2 để quản lý tiến trình"
  pm2 delete cmslaklu 2>/dev/null || true
  pm2 start ecosystem.config.js || { echo "ERROR: Không thể khởi động PM2"; exit 1; }
  
  # Lưu cấu hình PM2
  pm2 save || true
  
  # Hiển thị trạng thái
  pm2 status
else
  echo "- PM2 không được cài đặt, sử dụng npm start"
  echo "- Đang khởi động ứng dụng trong background..."
  nohup npm start > app.log 2>&1 &
  echo "- PID: $!"
fi

# Hiển thị thông tin kết nối
echo "===== THÔNG TIN KẾT NỐI ====="
echo "- Ứng dụng đang chạy trên cổng 3015"
echo "- URL: http://localhost:3015"

echo "===== TRIỂN KHAI THÀNH CÔNG ====="
echo "Thời gian hoàn thành: $(date)" 