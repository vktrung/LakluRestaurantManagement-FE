/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['qr.sepay.vn', 'api.laklu.com'], // Thêm hostname của URL hình ảnh
    disableStaticImages: true, // Tắt tối ưu hóa hình ảnh tĩnh để giảm bộ nhớ khi build
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
  // Vô hiệu hóa source maps để giảm bộ nhớ khi build
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  
  // Tắt incremental để giảm bộ nhớ RAM khi build
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: 'tsconfig.json',
  },
  
  // Tắt caching trong quá trình build
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },
  
  // Tắt strict mode trong production để tránh gọi API hai lần
  reactStrictMode: false,
  
  // Tối ưu hóa webpack cho môi trường ít tài nguyên
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Cải thiện Fast Refresh
      config.watchOptions = {
        ...config.watchOptions,
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: 1000,
      };
    }

    // Tối ưu hóa cho production (tắt minimize)
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: false,
        splitChunks: {
          cacheGroups: {
            default: false,
            vendors: false,
          },
        },
        runtimeChunk: false,
      };
      
      // Giảm số lượng chunk tạo ra để giảm bộ nhớ
      config.plugins = config.plugins.filter((plugin) => {
        if (plugin.constructor.name === 'ForkTsCheckerWebpackPlugin') return false;
        return true;
      });
    }
    
    return config;
  },
  
  // Tắt các tính năng không cần thiết trong quá trình build
  devIndicators: {
    buildActivity: false,
  },
  
  // Tắt các tính năng thử nghiệm không cần thiết
  experimental: {
    serverActions: true,
    optimizeCss: false,
    optimizeFonts: false,
    modularizeImports: false,
    legacyBrowsers: false,
    webVitalsAttribution: ['CLS', 'LCP'], // Giảm số lượng metrics theo dõi
  },
  
  // Sử dụng output cơ bản để giảm bộ nhớ
  output: 'standalone',
  
  // Tắt minimizer để giảm bộ nhớ sử dụng
  swcMinify: false,
  
  // Thêm để giảm bộ nhớ khi build
  compress: false,
  
  // Giảm kích thước build bằng cách chỉ hỗ trợ phiên bản ES mới
  future: {
    webpack5: true,
  },
};

export default nextConfig;