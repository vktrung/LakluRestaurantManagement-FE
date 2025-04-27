#!/bin/bash

# Script để build dự án Next.js trong môi trường có ít tài nguyên
# Được tạo bởi DevOps cho môi trường production

echo "===== ULTRALIGHT BUILD PROCESS - BẮT ĐẦU ====="
echo "Thời gian: $(date)"

# Khai báo các biến toàn cục
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export NEXT_DISABLE_SOURCEMAPS=1
export NEXT_TYPESCRIPT_CHECK=0
export NEXT_SHARP_PATH=false
export NODE_OPTIONS="--max-old-space-size=1024 --optimize-for-size"

# --- PHASE 1: CLEANUP ---
echo "===== PHASE 1: CLEANUP ====="
# Dừng tất cả các tiến trình node đang chạy (nếu có)
pkill -f node || true
# Xóa tất cả cache và temp files
rm -rf .next || true
rm -rf node_modules/.cache || true
rm -rf /tmp/next-* || true
# Dọn sạch npm cache
npm cache clean --force

# --- PHASE 2: MINIMAL DEPENDENCIES INSTALL ---
echo "===== PHASE 2: MINIMAL INSTALL ====="
# Xóa node_modules và cài đặt lại
rm -rf node_modules || true
# Cài đặt các dependencies trong chế độ production (không cài devDependencies)
echo "Cài đặt dependencies production-only..."
npm ci --production --no-optional --no-fund --no-audit || { echo "ERROR: Lỗi cài đặt dependencies"; exit 1; }
# Cài đặt critters
echo "Cài đặt critters..."
npm install --no-save critters || { echo "ERROR: Lỗi cài đặt critters"; exit 1; }

# --- PHASE 3: NEXT.JS OVERRIDE CONFIG ---
echo "===== PHASE 3: CONFIG OVERRIDE ====="
# Tạo cấu hình tối thiểu cho Next.js
cat > .next-minconfig.js << EOL
module.exports = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  swcMinify: false,
  productionBrowserSourceMaps: false,
  compress: false,
  poweredByHeader: false,
  images: { disableStaticImages: true, domains: ['qr.sepay.vn', 'api.laklu.com'] },
  experimental: { optimizeCss: false, optimizeFonts: false, modularizeImports: false },
  output: 'standalone',
  webpack: (config, { isServer }) => {
    // Disable code optimization
    config.optimization.minimize = false;
    // Disable chunking
    config.optimization.splitChunks = { cacheGroups: { default: false, vendors: false } };
    config.optimization.runtimeChunk = false;
    // Remove unnecessary plugins
    config.plugins = config.plugins.filter(plugin => {
      return plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin' && 
             plugin.constructor.name !== 'CssMinimizerPlugin';
    });
    return config;
  },
};
EOL

# --- PHASE 4: BUILD ---
echo "===== PHASE 4: BUILD PROCESS ====="
# Tạo các thư mục cần thiết trước
mkdir -p .next/cache/webpack
mkdir -p .next/server/chunks
mkdir -p .next/static/chunks
# Thực hiện build với cấu hình tối giản
echo "Đang build ứng dụng..."
next build --no-lint --config .next-minconfig.js || { echo "ERROR: Lỗi khi build ứng dụng"; exit 1; }

# --- PHASE 5: POST BUILD CLEANUP ---
echo "===== PHASE 5: POST-BUILD CLEANUP ====="
# Xóa cấu hình tạm thời
rm -f .next-minconfig.js
# Xóa cache không cần thiết
rm -rf .next/cache

echo "===== ULTRALIGHT BUILD PROCESS - HOÀN THÀNH ====="
echo "Thời gian hoàn thành: $(date)" 