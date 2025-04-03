import { endpoints } from '@/configs/endpoints';

import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { Staff, StaffResponse, CreateStaffPayload, StaffByIdResponse } from './types';

export interface GetStaffParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export const staffApiSlice = createApi({
  reducerPath: 'staffApi',
  baseQuery,
  tagTypes: ['staff-list', 'staff'],
  endpoints: builder => ({
    getStaff: builder.query<StaffResponse, GetStaffParams | void>({
      query: (params) => {
        // Nếu không có tham số, không thêm query params
        if (!params) {
          return {
            url: `${endpoints.getListStaff}/with-profile`,
            method: 'GET',
          };
        }
        
        // Xây dựng query params từ tham số được truyền vào
        const { page = 0, size = 10, sortBy = 'id', sortDir = 'asc' } = params;
        return {
          url: `${endpoints.getListStaff}with-profile`,
          method: 'GET',
          params: { page, size, sortBy, sortDir },
        };
      },
      providesTags: ['staff-list'],
    }),
    getStaffById: builder.query<StaffByIdResponse, string>({
      query: id => ({
        url: `${endpoints.getListStaff}/${id}`,
        method: 'GET',
      }),
      providesTags: ['staff'],
    }),
    createStaff: builder.mutation<Staff, CreateStaffPayload>({
      query: (payload) => ({
        url: `${endpoints.getListStaff}`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['staff-list'],
    }),
  }),
});

export const {
  useGetStaffByIdQuery,
  useGetStaffQuery,
  useCreateStaffMutation,
} = staffApiSlice;
