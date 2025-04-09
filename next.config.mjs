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
    ];
  },
};

export default nextConfig;