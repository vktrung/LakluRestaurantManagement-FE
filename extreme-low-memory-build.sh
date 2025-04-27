#!/bin/bash

echo "===== BẮT ĐẦU QUÁ TRÌNH BUILD CHO MÔI TRƯỜNG RAM CỰC THẤP ====="
echo "Thời gian: $(date)"

# Tối ưu hóa các tùy chọn Node.js để tiết kiệm bộ nhớ
export NODE_OPTIONS="--max-old-space-size=1536 --max-semi-space-size=64 --gc-interval=100 --gc-global"
export NEXT_TELEMETRY_DISABLED=1
export NEXT_DISABLE_SOURCEMAPS=1
export NODE_ENV=production
export NEXT_SHARP_PATH=false
export NEXT_TYPESCRIPT_CHECK=0

# Dọn dẹp toàn bộ trước khi build
echo "===== DỌN DẸP TRIỆT ĐỂ ====="
rm -rf .next || true
rm -rf node_modules || true
npm cache clean --force
rm -rf /tmp/next-* || true

# Cài đặt dependencies với tùy chọn tối thiểu
echo "===== CÀI ĐẶT DEPENDENCIES TỐI THIỂU ====="
npm ci --production --no-optional --no-fund --no-audit || { echo "Lỗi khi cài đặt dependencies"; exit 1; }

# Cài đặt critters riêng
echo "===== CÀI ĐẶT CRITTERS ====="
npm install --no-save critters || { echo "Lỗi khi cài đặt critters"; exit 1; }

# Tạo file .env.production.local với cấu hình tối ưu
echo "===== TẠO CẤU HÌNH MÔI TRƯỜNG ====="
cat > .env.production.local << EOL
NEXT_TELEMETRY_DISABLED=1
NEXT_DISABLE_SOURCEMAPS=1
NODE_ENV=production
NEXT_TYPESCRIPT_CHECK=0
NEXT_SHARP_PATH=false
EOL

# Tạo file next.config.build.js cho build tạm thời với các tùy chọn tối thiểu
echo "===== TẠO CẤU HÌNH NEXT.JS TẠM THỜI ====="
cat > next.config.build.js << EOL
/** @type {import('next').NextConfig} */
module.exports = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: false,
  productionBrowserSourceMaps: false,
  optimizeFonts: false,
  output: 'standalone',
  compress: false,
  images: {
    disableStaticImages: true,
    domains: ['qr.sepay.vn', 'api.laklu.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.minimize = false;
      config.optimization.splitChunks = {
        cacheGroups: {
          default: false,
          vendors: false,
        }
      };
      config.optimization.runtimeChunk = false;
    }
    return config;
  },
};
EOL

# Build với cấu hình tối thiểu
echo "===== BUILD VỚI CẤU HÌNH TỐI THIỂU ====="
NODE_ENV=production npx next build --no-lint --config next.config.build.js || { echo "Lỗi khi build ứng dụng"; exit 1; }

# Dọn dẹp sau build
echo "===== DỌN DẸP SAU BUILD ====="
rm -f next.config.build.js || true
rm -rf .next/cache || true

# Thông báo hoàn thành
echo "===== BUILD THÀNH CÔNG ====="
echo "Quá trình build đã hoàn tất thành công!"
echo "===== KẾT THÚC QUÁ TRÌNH BUILD CHO MÔI TRƯỜNG RAM CỰC THẤP =====" 