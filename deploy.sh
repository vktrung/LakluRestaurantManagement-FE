#!/bin/bash

# Hiển thị thông báo và ngày giờ
echo "===== BẮT ĐẦU QUÁ TRÌNH TRIỂN KHAI ====="
echo "Thời gian: $(date)"

# Thiết lập biến môi trường cần thiết
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export NEXT_DISABLE_SOURCEMAPS=1
export NEXT_TYPESCRIPT_CHECK=0

# Thực hiện build siêu nhẹ
echo "===== SỬ DỤNG ULTRALIGHT BUILD ====="
chmod +x ultralight-build.sh
./ultralight-build.sh || { echo "Lỗi trong quá trình build"; exit 1; }

# Khởi động ứng dụng với PM2
echo "===== KHỞI ĐỘNG ỨNG DỤNG ====="
pm2 delete cmslaklu || true
pm2 start ecosystem.config.js || { echo "Lỗi khi khởi động ứng dụng"; exit 1; }

# Thông báo hoàn thành
echo "===== TRIỂN KHAI THÀNH CÔNG ====="
echo "Ứng dụng đã được triển khai và khởi động thành công!"
echo "===== KẾT THÚC QUÁ TRÌNH TRIỂN KHAI =====" 