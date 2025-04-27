#!/bin/bash

echo "===== BẮT ĐẦU QUÁ TRÌNH BUILD HAI GIAI ĐOẠN ====="
echo "Thời gian: $(date)"

# Giai đoạn 1: Chuẩn bị và dọn dẹp
echo "===== GIAI ĐOẠN 1: CHUẨN BỊ VÀ DỌN DẸP ====="

# Dọn dẹp cache và thư mục build cũ
rm -rf .next || true
rm -rf node_modules/.cache || true
npm cache clean --force

# Cài đặt dependencies trong chế độ production để giảm kích thước
echo "===== CÀI ĐẶT DEPENDENCIES (CHẾ ĐỘ PRODUCTION) ====="
npm ci --production --no-optional || { echo "Lỗi khi cài đặt dependencies"; exit 1; }

# Thêm critters vì cần thiết cho build
npm install --no-save critters || { echo "Lỗi khi cài đặt critters"; exit 1; }

# Tạo file .env.production.local với các cấu hình để tối ưu hóa build
echo "===== TẠO CẤU HÌNH MÔI TRƯỜNG ====="
cat > .env.production.local << EOL
NEXT_TELEMETRY_DISABLED=1
NEXT_DISABLE_SOURCEMAPS=1
NODE_ENV=production
NEXT_SHARP_PATH=false
EOL

# Giai đoạn 2: Build dự án
echo "===== GIAI ĐOẠN 2: BUILD DỰ ÁN ====="

# Thiết lập biến môi trường
export NODE_OPTIONS="--max-old-space-size=2048 --gc-global"
export NEXT_TELEMETRY_DISABLED=1
export NEXT_DISABLE_SOURCEMAPS=1
export NODE_ENV=production
export NEXT_SHARP_PATH=false

# Build với các tùy chọn tối thiểu
echo "===== ĐANG BUILD ỨNG DỤNG (CHẾ ĐỘ TỐI THIỂU) ====="
next build --no-lint --no-typescript || { echo "Lỗi khi build ứng dụng"; exit 1; }

# Nếu thành công, dọn dẹp cache không cần thiết
echo "===== DỌN DẸP SAU BUILD ====="
rm -rf .next/cache || true

# Thông báo hoàn thành
echo "===== BUILD THÀNH CÔNG ====="
echo "Quá trình build đã hoàn tất thành công!"
echo "===== KẾT THÚC QUÁ TRÌNH BUILD HAI GIAI ĐOẠN =====" 