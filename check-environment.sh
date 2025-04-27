#!/bin/bash

# Script để kiểm tra môi trường Linux trước khi build
echo "===== KIỂM TRA MÔI TRƯỜNG LINUX ====="
echo "Thời gian: $(date)"

# Kiểm tra OS
echo "===== HỆ ĐIỀU HÀNH ====="
OS=$(uname -s)
KERNEL=$(uname -r)
echo "- OS: $OS"
echo "- Kernel: $KERNEL"

if [ "$OS" != "Linux" ]; then
  echo "CẢNH BÁO: Môi trường tối ưu là Linux, nhưng bạn đang chạy trên $OS"
  echo "Có thể sẽ gặp một số vấn đề tương thích."
fi

# Kiểm tra Node.js và NPM
echo "===== PHIÊN BẢN NODE.JS & NPM ====="
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo "- Node.js: $NODE_VERSION"
  
  # Kiểm tra phiên bản Node.js
  NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | tr -d 'v')
  if [ "$NODE_MAJOR" -lt 16 ]; then
    echo "CẢNH BÁO: Phiên bản Node.js quá cũ. Khuyến nghị v16+"
  fi
else
  echo "LỖI: Node.js chưa được cài đặt"
  echo "Vui lòng cài đặt Node.js v16 hoặc cao hơn"
  exit 1
fi

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm -v)
  echo "- NPM: $NPM_VERSION"
else
  echo "LỖI: NPM chưa được cài đặt"
  exit 1
fi

# Kiểm tra PM2
echo "===== KIỂM TRA PM2 ====="
if command -v pm2 &> /dev/null; then
  PM2_VERSION=$(pm2 -v 2>/dev/null || echo "Không xác định")
  echo "- PM2: $PM2_VERSION"
else
  echo "CẢNH BÁO: PM2 chưa được cài đặt. Sẽ sử dụng npm start cho triển khai"
  echo "Khuyến nghị: npm install -g pm2"
fi

# Kiểm tra bộ nhớ hệ thống
echo "===== BỘ NHỚ HỆ THỐNG ====="
if command -v free &> /dev/null; then
  TOTAL_MEM=$(free -m | grep Mem | awk '{print $2}')
  AVAIL_MEM=$(free -m | grep Mem | awk '{print $7}')
  SWAP_TOTAL=$(free -m | grep Swap | awk '{print $2}')
  
  echo "- Tổng RAM: ${TOTAL_MEM}MB"
  echo "- RAM khả dụng: ${AVAIL_MEM}MB"
  echo "- Swap: ${SWAP_TOTAL}MB"
  
  if [ $TOTAL_MEM -lt 1024 ]; then
    echo "CẢNH BÁO: RAM thấp (< 1GB). Có thể gặp vấn đề khi build"
    if [ $SWAP_TOTAL -lt 1024 ]; then
      echo "Đề xuất: Tạo ít nhất 2GB swap"
      echo "sudo fallocate -l 2G /swapfile"
      echo "sudo chmod 600 /swapfile"
      echo "sudo mkswap /swapfile"
      echo "sudo swapon /swapfile"
    fi
  fi
else
  echo "Không thể kiểm tra bộ nhớ (lệnh 'free' không khả dụng)"
fi

# Kiểm tra CPU
echo "===== CPU ====="
if [ -f /proc/cpuinfo ]; then
  CPU_CORES=$(grep -c ^processor /proc/cpuinfo)
  CPU_MODEL=$(grep "model name" /proc/cpuinfo | head -1 | cut -d: -f2 | sed 's/^ *//')
  
  echo "- CPU Cores: $CPU_CORES"
  echo "- CPU Model: $CPU_MODEL"
  
  if [ $CPU_CORES -lt 2 ]; then
    echo "CẢNH BÁO: Số lượng CPU cores thấp (< 2). Build có thể chậm."
  fi
else
  echo "Không thể kiểm tra thông tin CPU"
fi

# Kiểm tra dung lượng ổ đĩa
echo "===== DUNG LƯỢNG Ổ ĐĨA ====="
if command -v df &> /dev/null; then
  DISK_AVAIL=$(df -h . | awk 'NR==2 {print $4}')
  DISK_USED_PERCENT=$(df -h . | awk 'NR==2 {print $5}')
  
  echo "- Dung lượng khả dụng: $DISK_AVAIL"
  echo "- Đã sử dụng: $DISK_USED_PERCENT"
  
  DISK_PERCENT_NUM=$(echo $DISK_USED_PERCENT | tr -d '%')
  if [ $DISK_PERCENT_NUM -gt 90 ]; then
    echo "CẢNH BÁO: Ổ đĩa gần đầy (> 90%). Có thể gặp vấn đề khi build"
  fi
else
  echo "Không thể kiểm tra dung lượng ổ đĩa"
fi

echo "===== KIỂM TRA HOÀN TẤT ====="

# Đánh giá tổng thể
if [ $TOTAL_MEM -lt 1024 ] || [ $CPU_CORES -lt 2 ]; then
  echo "⚠️ HỆ THỐNG CÓ TÀI NGUYÊN THẤP - Nên sử dụng minimal-build.sh"
else
  echo "✅ HỆ THỐNG CÓ ĐỦ TÀI NGUYÊN - Có thể sử dụng deploy.sh"
fi 