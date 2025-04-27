#!/bin/bash

echo "===== BẮT ĐẦU QUÁ TRÌNH BUILD TÁCH PHẦN ====="
echo "Thời gian: $(date)"

# Các tùy chọn chung
export NODE_OPTIONS="--max-old-space-size=2048"
export NEXT_DISABLE_SOURCEMAPS=1
export NEXT_TYPESCRIPT_CHECK=0

# Xóa thư mục .next nếu tồn tại
echo "===== DỌN DẸP CACHE ====="
rm -rf .next || true

# Cài đặt dependencies với --production để giảm số lượng package
echo "===== CÀI ĐẶT DEPENDENCIES (CHẾ ĐỘ PRODUCTION) ====="
npm ci --production || { echo "Lỗi khi cài đặt dependencies"; exit 1; }

# Cài đặt critters riêng
echo "===== CÀI ĐẶT CRITTERS ====="
npm install --no-save critters || { echo "Lỗi khi cài đặt critters"; exit 1; }

# Tạo thư mục .next cơ bản
echo "===== KHỞI TẠO THƯ MỤC BUILD ====="
mkdir -p .next/server
mkdir -p .next/static
mkdir -p .next/cache

# 1. Build phần đầu tiên - Chỉ build phần server
echo "===== BUILD PHẦN SERVER ====="
NODE_ENV=production npx next build --no-lint || { echo "Lỗi khi build phần server"; exit 1; }

# Giải phóng bộ nhớ
echo "===== GIẢI PHÓNG BỘ NHỚ ====="
npm cache clean --force

# Hoàn tất
echo "===== BUILD HOÀN TẤT ====="
echo "Quá trình build đã hoàn thành!"
echo "===== KẾT THÚC QUÁ TRÌNH BUILD TÁCH PHẦN =====" 