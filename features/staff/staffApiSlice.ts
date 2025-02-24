import { endpoints } from '@/configs/endpoints';

import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { Staff, StaffResponse, CreateStaffPayload } from './types';

export const staffApiSlice = createApi({
  reducerPath: 'staffApi',
  baseQuery,
  tagTypes: ['staff-list', 'staff'],
  endpoints: builder => ({
    getStaff: builder.query<StaffResponse, void>({
      query: () => ({
        url: `${endpoints.getListStaff}`,
        method: 'GET',
      }),
      providesTags: ['staff-list'],
    }),
    getStaffById: builder.query<Staff, string>({
      query: id => ({
        url: `${endpoints.getListStaff}/${id}`,
        method: 'GET',
      }),
      providesTags: ['staff'],
    }),
    createStaff: builder.mutation<Staff, CreateStaffPayload>({
      query: (payload) => ({
        url: `${endpoints.getListStaff}`,  // Bạn cần cấu hình đúng URL ở đây
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['staff-list'], // Tự động "làm mới" danh sách staff
    }),
  }),
});

export const {
    useGetStaffByIdQuery,
    useGetStaffQuery,
    useCreateStaffMutation,
} = staffApiSlice;
