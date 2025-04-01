import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '@/features/baseQuery';
import { AddRoleRequest, AddRoleResponse, RoleDetailResponse, RoleResponse, UpdateRoleRequest } from './types';
import { endpoints } from '@/configs/endpoints';

export const roleApiSlice = createApi({
  reducerPath: 'roleApi',
  baseQuery,
  tagTypes: ['role-list', 'role'],
  endpoints: (builder) => ({
    getRoles: builder.query<RoleResponse, void>({
      query: () => ({
        url: `${endpoints.getRoles}`,
        method: 'GET',
      }),
      providesTags: ['role-list'],
    }),
    getRoleById: builder.query<RoleDetailResponse, number>({
      query: (id: number) => ({
        url: `${endpoints.getRoles}${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'role', id }],
    }),
    addRole: builder.mutation<AddRoleResponse, AddRoleRequest>({
      query: (newRole) => ({
        url: `${endpoints.getRoles}`,
        method: 'POST',
        body: newRole,
      }),
      invalidatesTags: ['role-list'],
    }),
    updateRolePermissions: builder.mutation<RoleDetailResponse, UpdateRoleRequest>({
      query: (updateData) => ({
        url: `${endpoints.getRoles}${updateData.id}`,
        method: 'PUT',
        body: {
          name: updateData.name,
          description: updateData.description,
          permissions: updateData.permissions
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'role', id }, 'role-list'],
    }),
    deleteRoleById: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `${endpoints.getRoles}${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['role-list'],
    }),
  }),
});

export const { useGetRolesQuery, useGetRoleByIdQuery, useLazyGetRoleByIdQuery, useAddRoleMutation, useUpdateRolePermissionsMutation, useDeleteRoleByIdMutation } = roleApiSlice;
