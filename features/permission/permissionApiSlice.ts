import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '@/features/baseQuery';
import {
  PermissionGroupResponse,
  Permission,
  UpdatePermissionPayload
} from './types';
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
      // Chuyển đổi dữ liệu trả về: parse trường description nếu nó ở dạng JSON string
      transformResponse: (response: PermissionGroupResponse) => {
        const transformedData = response.data.map(group => ({
          ...group,
          permissions: group.permissions.map(permission => ({
            ...permission,
            description: permission.description
              ? (() => {
                  try {
                    const parsed = JSON.parse(permission.description);
                    // Nếu parsed có thuộc tính description, trả về nó, ngược lại trả về chính chuỗi ban đầu
                    return parsed.description || permission.description;
                  } catch (error) {
                    return permission.description;
                  }
                })()
              : null,
          })),
        }));
        return { ...response, data: transformedData };
      },
      providesTags: ['permission-list'],
    }),
    updatePermission: builder.mutation<Permission, UpdatePermissionPayload>({
      query: ({ id, description, ...rest }) => ({
        url: `${endpoints.getPermissions}${id}`, // Cần đảm bảo URL update đúng với API của bạn
        method: 'PUT',
        body: {
          ...rest,
          // Gửi description là plain text (ví dụ: "test")
          description: description,
        },
      }),
      invalidatesTags: ['permission-list', 'permission'],
    }),
  }),
});

export const { useGetPermissionQuery, useUpdatePermissionMutation } = permissionApiSlice;
