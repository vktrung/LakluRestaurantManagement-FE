import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '@/features/baseQuery';
import { RoleResponse } from './types';
import { endpoints } from '@/configs/endpoints';

export const roleApiSlice = createApi({
  reducerPath: 'roleApi',
  baseQuery,
  tagTypes: ['role-list', 'role'],
  endpoints: (builder) => ({
    getRoles: builder.query<RoleResponse, void>({
      query: () => ({
        url: `${endpoints.getRoles}`, // Đảm bảo cấu hình đúng URL trong file endpoints
        method: 'GET',
      }),
      providesTags: ['role-list'],
    }),
  }),
});

export const { useGetRolesQuery } = roleApiSlice;
