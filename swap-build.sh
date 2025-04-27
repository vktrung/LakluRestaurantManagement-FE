#!/bin/bash

echo "===== BẮT ĐẦU QUÁ TRÌNH BUILD VỚI SWAP ẢO ====="
echo "Thời gian: $(date)"

# Tạo SWAP file ảo để tăng bộ nhớ (nếu có quyền sudo)
echo "===== KIỂM TRA VÀ TẠO SWAP FILE ====="
SWAP_FILE=/swapfile
SWAP_SIZE=2G

if [ ! -f "$SWAP_FILE" ]; then
  echo "Swap file không tồn tại, thử tạo mới..."
  
  if command -v sudo >/dev/null 2>&1; then
    echo "Tạo swap file $SWAP_SIZE..."
    sudo fallocate -l $SWAP_SIZE $SWAP_FILE || { echo "Không thể tạo swap file"; }
    
    if [ -f "$SWAP_FILE" ]; then
      sudo chmod 600 $SWAP_FILE
      sudo mkswap $SWAP_FILE
      sudo swapon $SWAP_FILE
      echo "Đã tạo và kích hoạt swap file."
    fi
  else
    echo "Không có quyền sudo để tạo swap file."
  fi
else
  echo "Swap file đã tồn tại."
fi

# Cấu hình môi trường build
export NODE_OPTIONS="--max-old-space-size=2048 --gc-global"
export NEXT_TELEMETRY_DISABLED=1
export NEXT_DISABLE_SOURCEMAPS=1
export NODE_ENV=production
export NEXT_TYPESCRIPT_CHECK=0

# Dọn dẹp
echo "===== DỌN DẸP TRƯỚC BUILD ====="
rm -rf .next || true
npm cache clean --force

# Cài đặt dependencies
echo "===== CÀI ĐẶT DEPENDENCIES ====="
npm ci --production --no-audit || { echo "Lỗi khi cài đặt dependencies"; exit 1; }

# Cài đặt critters
echo "===== CÀI ĐẶT CRITTERS ====="
npm install --no-save critters || { echo "Lỗi khi cài đặt critters"; exit 1; }

# Build theo từng phần
echo "===== BUILD ỨNG DỤNG ====="
NODE_ENV=production next build --no-lint || { echo "Lỗi khi build ứng dụng"; exit 1; }

# Tắt SWAP nếu đã tạo mới
if command -v sudo >/dev/null 2>&1 && [ -f "$SWAP_FILE" ]; then
  echo "===== TẮT SWAP FILE ====="
  sudo swapoff $SWAP_FILE
  echo "Đã tắt swap file."
fi

# Thông báo hoàn thành
echo "===== BUILD THÀNH CÔNG ====="
echo "Quá trình build đã hoàn tất thành công!"
echo "===== KẾT THÚC QUÁ TRÌNH BUILD VỚI SWAP ẢO =====" 