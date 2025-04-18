import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SERVER_URL } from '@/configs/site.config';
import { getTokenFromCookie } from '@/utils/token';

const baseQuery = fetchBaseQuery({
  baseUrl: SERVER_URL,
  prepareHeaders: headers => {
    const token = getTokenFromCookie();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Thêm header để ngăn chặn caching
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    return headers;
  },
});

export default baseQuery;
