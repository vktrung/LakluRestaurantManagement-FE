#!/bin/bash

# Hiển thị thông báo và ngày giờ
echo "===== BẮT ĐẦU QUÁ TRÌNH TRIỂN KHAI ====="
echo "Thời gian: $(date)"

# Cài đặt các dependencies
echo "===== CÀI ĐẶT DEPENDENCIES ====="
npm ci || { echo "Lỗi khi cài đặt dependencies"; exit 1; }

# Cài đặt critters (vì gặp lỗi với module này)
echo "===== CÀI ĐẶT CRITTERS ====="
npm install critters --save || { echo "Lỗi khi cài đặt critters"; exit 1; }

# Xóa các file cache thừa (nếu có)
echo "===== DỌN DẸP CACHE ====="
rm -rf .next || true

# Build với bộ nhớ heap cao hơn và tắt kiểm tra types
echo "===== ĐANG BUILD ỨNG DỤNG ====="
NODE_OPTIONS="--max-old-space-size=6144" NODE_ENV=production NEXT_DISABLE_SOURCEMAPS=1 next build --no-lint --no-typescript || { echo "Lỗi khi build ứng dụng"; exit 1; }

# Thông báo hoàn thành
echo "===== BUILD THÀNH CÔNG ====="
echo "Quá trình build đã hoàn tất thành công!"
echo "===== KẾT THÚC QUÁ TRÌNH TRIỂN KHAI =====" 