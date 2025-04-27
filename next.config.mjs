/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['qr.sepay.vn', 'api.laklu.com'], // Thêm hostname của URL hình ảnh
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.laklu.com/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      // Cấu hình riêng cho các tệp tĩnh và chunks
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          }
        ],
      },
      {
        source: '/_next/data/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0, must-revalidate',
          }
        ],
      },
      {
        source: '/.next/static/chunks/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
    ];
  },
  // Tăng cường xử lý lỗi trong môi trường production
  productionBrowserSourceMaps: false, // Tắt source maps để giảm bộ nhớ khi build
  poweredByHeader: false, // Tắt header 'X-Powered-By' vì lý do bảo mật
  // Đảm bảo không có caching cho dữ liệu động
  onDemandEntries: {
    // Thời gian (tính bằng ms) trước khi phần bộ nhớ cache của compiler bị xóa
    maxInactiveAge: 15 * 1000,
    // Số lượng trang giữ trong bộ nhớ
    pagesBufferLength: 2,
  },
  // Thêm cấu hình React Strict Mode để dễ phát hiện lỗi
  reactStrictMode: false, // Tắt strict mode trong production để tránh gọi API hai lần
  // Thêm cấu hình webpackDevMiddleware để cải thiện Fast Refresh
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Cải thiện Fast Refresh
      config.watchOptions = {
        ...config.watchOptions,
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: 1000, // Kiểm tra các thay đổi mỗi giây
      };
    }

    // Tối ưu hóa build cho production
    if (!dev) {
      // Tắt minimize để giảm tải cho quá trình build nếu gặp vấn đề
      config.optimization = {
        ...config.optimization,
        minimize: false
      };
    }
    
    return config;
  },
  // Cấu hình cho Fast Refresh
  devIndicators: {
    buildActivity: true,
  },
  // Đảm bảo rằng Fast Refresh được kích hoạt
  experimental: {
    // Tắt các tính năng thử nghiệm không cần thiết
    serverActions: true,
    // Tắt optimizeCss để tránh lỗi critters
    optimizeCss: false,
    // Tắt tính năng gây tốn bộ nhớ
    optimizeFonts: false,
    modularizeImports: false,
  },
  // Sử dụng standalone output để đóng gói dependencies
  output: 'standalone',
  // Cấu hình swcMinify - cân nhắc tắt nếu vẫn gặp vấn đề
  swcMinify: false, 
};

export default nextConfig;