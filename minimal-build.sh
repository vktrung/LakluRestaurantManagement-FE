#!/bin/bash

echo "===== BẮT ĐẦU QUÁ TRÌNH BUILD TỐI THIỂU ====="
echo "Thời gian: $(date)"

# Đảm bảo npm sử dụng ít bộ nhớ
export NODE_OPTIONS="--max-old-space-size=2048 --gc-global --optimize-for-size"
export NEXT_DISABLE_SOURCEMAPS=1
export NEXT_MINIMAL=1

# Xóa thư mục .next nếu tồn tại
echo "===== DỌN DẸP CACHE ====="
rm -rf .next || true

# Xóa node_modules và cài đặt lại các dependencies trong chế độ production
echo "===== CÀI ĐẶT DEPENDENCIES (CHẾ ĐỘ PRODUCTION) ====="
rm -rf node_modules || true
npm ci --production || { echo "Lỗi khi cài đặt dependencies"; exit 1; }

# Thêm riêng critters vì cần thiết cho build
echo "===== CÀI ĐẶT CRITTERS ====="
npm install --no-save critters || { echo "Lỗi khi cài đặt critters"; exit 1; }

# Build với các tùy chọn tối thiểu
echo "===== ĐANG BUILD ỨNG DỤNG (CHẾ ĐỘ TỐI THIỂU) ====="
NODE_ENV=production next build --no-lint --no-typescript || { echo "Lỗi khi build ứng dụng"; exit 1; }

# Thông báo hoàn thành
echo "===== BUILD THÀNH CÔNG ====="
echo "Quá trình build đã hoàn tất thành công!"
echo "===== KẾT THÚC QUÁ TRÌNH BUILD TỐI THIỂU =====" 