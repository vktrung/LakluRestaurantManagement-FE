import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SERVER_URL } from '@/configs/site.config';
import { getTokenFromCookie } from '@/utils/token';

const baseQuery = fetchBaseQuery({
  baseUrl: SERVER_URL,
  prepareHeaders: headers => {
    // Kiểm tra nếu đang ở môi trường client trước khi lấy token
    const token = typeof window !== 'undefined' ? getTokenFromCookie() : '';
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Thêm header để ngăn chặn caching
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    return headers;
  },
  fetchFn: async (...args) => {
    try {
      return await fetch(...args);
    } catch (error) {
      console.error("Network error in fetch:", error);
      // Xử lý lỗi mạng trên client-side
      if (typeof window !== 'undefined') {
        // Các lỗi kết nối có thể xảy ra trên client
        if (error instanceof TypeError && error.message.includes('network')) {
          console.error("Lỗi kết nối mạng:", error);
        }
      }
      throw error;
    }
  }
});

export default baseQuery;
