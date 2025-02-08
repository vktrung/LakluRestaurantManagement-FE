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
    return headers;
  },
});

export default baseQuery;
