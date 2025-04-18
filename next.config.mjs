/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['qr.sepay.vn'], // Thêm hostname của URL hình ảnh
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
            value: 'no-store, max-age=0',
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
  // Đảm bảo không có caching cho dữ liệu động
  onDemandEntries: {
    // Thời gian (tính bằng ms) trước khi phần bộ nhớ cache của compiler bị xóa
    maxInactiveAge: 15 * 1000,
    // Số lượng trang giữ trong bộ nhớ
    pagesBufferLength: 2,
  },
};

export default nextConfig;