#!/bin/bash

# Script build tối giản cho Linux
echo "===== LINUX MINIMAL BUILD PROCESS ====="
echo "Thời gian: $(date)"

# Xác định tài nguyên hệ thống
echo "===== KIỂM TRA TÀI NGUYÊN HỆ THỐNG ====="
TOTAL_MEM=$(free -m | grep Mem | awk '{print $2}')
AVAIL_MEM=$(free -m | grep Mem | awk '{print $7}')
CPU_CORES=$(grep -c ^processor /proc/cpuinfo)

echo "- Tổng RAM: ${TOTAL_MEM}MB"
echo "- RAM khả dụng: ${AVAIL_MEM}MB"
echo "- CPU cores: ${CPU_CORES}"

# Tính toán bộ nhớ cho Node.js (50% RAM khả dụng nhưng không quá 1024MB)
if [ $AVAIL_MEM -lt 1024 ]; then
  MEM_SIZE=$((AVAIL_MEM / 2))
  if [ $MEM_SIZE -lt 512 ]; then
    MEM_SIZE=512
  fi
else
  MEM_SIZE=1024
fi
echo "- Sử dụng ${MEM_SIZE}MB cho Node.js heap"

# Dọn dẹp trước khi build
echo "===== DỌN DẸP HỆ THỐNG ====="
rm -rf .next || true
rm -rf node_modules/.cache || true
rm -rf /tmp/next-* || true
npm cache clean --force

# Giải phóng bộ nhớ hệ thống
echo "===== GIẢI PHÓNG BỘ NHỚ ====="
sync
echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
pkill -f node || true

# Cài đặt dependencies
echo "===== CÀI ĐẶT DEPENDENCIES ====="
rm -rf node_modules || true
JOBS=$((CPU_CORES > 1 ? CPU_CORES - 1 : 1))
npm ci --production --no-optional --no-fund --no-audit --prefer-offline --jobs=$JOBS || { echo "ERROR: Lỗi cài đặt dependencies"; exit 1; }
npm install --no-save critters --no-fund --no-audit || { echo "ERROR: Lỗi cài đặt critters"; exit 1; }

# Tạo cấu hình minimal Next.js
echo "===== TẠO CẤU HÌNH NEXT.JS TỐI GIẢN ====="
cat > linux-minimal.config.js << EOL
/** @type {import('next').NextConfig} */
module.exports = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  swcMinify: false,
  productionBrowserSourceMaps: false,
  compress: false,
  images: { 
    disableStaticImages: true, 
    domains: ['qr.sepay.vn', 'api.laklu.com']
  },
  experimental: { 
    optimizeCss: false, 
    optimizeFonts: false 
  },
  output: 'standalone',
  webpack: (config) => {
    // Tối ưu webpack config
    config.optimization.minimize = false;
    
    // Vô hiệu hóa code splitting
    config.optimization.splitChunks = { 
      cacheGroups: { 
        default: false, 
        vendors: false 
      } 
    };
    config.optimization.runtimeChunk = false;
    return config;
  },
};
EOL

# Thiết lập biến môi trường
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export NEXT_DISABLE_SOURCEMAPS=1
export NEXT_TYPESCRIPT_CHECK=0
export NODE_OPTIONS="--max-old-space-size=${MEM_SIZE}"

# Tiến hành build
echo "===== BUILD ỨNG DỤNG ====="
next build --no-lint --config linux-minimal.config.js || { echo "ERROR: Lỗi khi build ứng dụng"; exit 1; }

# Dọn dẹp sau build
rm -f linux-minimal.config.js

echo "===== BUILD THÀNH CÔNG ====="
echo "Thời gian hoàn thành: $(date)" 