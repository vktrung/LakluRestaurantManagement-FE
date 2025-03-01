import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '@/features/baseQuery';
import { AddRoleRequest, AddRoleResponse, RoleDetailResponse, RoleResponse } from './types';
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
    getRoleById: builder.query<RoleDetailResponse, number>({
      query: (id: number) => ({
        url: `${endpoints.getRoles}${id}`, // Giả sử endpoint chi tiết thêm id vào cuối URL
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'role', id }],
    }),
     addRole: builder.mutation<AddRoleResponse, AddRoleRequest>({
      query: (newRole) => ({
        url: `${endpoints.getRoles}`, // Giả sử endpoint thêm role sử dụng URL tương tự
        method: 'POST',
        body: newRole,
      }),
      // Khi thêm role thành công, invalidate cache của danh sách role để tự động refetch
      invalidatesTags: ['role-list'],
     }),
     deleteRoleById: builder.mutation<RoleResponse, number>({
      query: (id:number) => ({
        url: `${endpoints.getRoles}${id}`, // Đảm bảo cấu hình đúng URL trong file endpoints
        method: 'DELETE',
      }),
      invalidatesTags: ['role-list'],
    }),
  }),
  
});

export const { useGetRolesQuery,useGetRoleByIdQuery,useLazyGetRoleByIdQuery ,useAddRoleMutation, useDeleteRoleByIdMutation  } = roleApiSlice;
