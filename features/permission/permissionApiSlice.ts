import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '@/features/baseQuery';
import { PermissionGroupResponse } from './types';
import { endpoints } from '@/configs/endpoints';

export const permissionApiSlice = createApi({
  reducerPath: 'permissionApi',
  baseQuery,
  tagTypes: ['permission-list', 'permission'],
  endpoints: (builder) => ({
    getPermission: builder.query<PermissionGroupResponse, void>({
      query: () => ({
        url: `${endpoints.getPermissions}`, // Đảm bảo URL đã được cấu hình đúng
        method: 'GET',
      }),
      providesTags: ['permission-list'],
    }),
  }),
});

export const { useGetPermissionQuery } = permissionApiSlice;
