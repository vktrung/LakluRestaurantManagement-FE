import { endpoints } from '@/configs/endpoints';

import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { Staff, StaffResponse } from './types';

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
  }),
});

export const {
    useGetStaffByIdQuery,
    useGetStaffQuery,
} = staffApiSlice;
