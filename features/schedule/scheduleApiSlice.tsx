import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { GetShiftById, AddShiftRequest, UpdateShiftRequest, GetAllShiftsResponse,GetShiftsByDateRangeResponse,GetShiftsByDateRangeRequest } from './types';  // Import các types từ file types.ts

export const scheduleApiSlice = createApi({
  reducerPath: 'scheduleApi',
  baseQuery,
  tagTypes: ['schedule-list', 'schedule'],
  endpoints: builder => ({
    getAllShifts: builder.query<GetAllShiftsResponse, void>({
      query: () => ({
        url: endpoints.ScheduleApi,  
        method: 'GET',
      }),
      providesTags: ['schedule-list'],
    }),
    getShiftsByDateRange: builder.query<GetShiftsByDateRangeResponse, GetShiftsByDateRangeRequest>({
      query: ({ startDate, endDate }) => ({
        url: endpoints.ScheduleApi + "by-date-range",
        params: { startDate, endDate },
      }),
      providesTags: (result, error, arg) => [{ type: 'schedule-list', id: arg.startDate + "_" + arg.endDate }],
      keepUnusedDataFor: 0,
    }),

    getShiftById: builder.query<GetShiftById, number>({
      query: id => ({
        url: `${endpoints.ScheduleApi}${id.toString()}`,  
        method: 'GET',
      }),
      providesTags: ['schedule'],
    }),

    createShift: builder.mutation<GetAllShiftsResponse, AddShiftRequest>({
      query: body => ({
        url: endpoints.ScheduleApi,  
        method: 'POST',
        body,
      }),
      invalidatesTags: ['schedule-list'],
    }),

    updateShift: builder.mutation<GetAllShiftsResponse, { id: number; body: UpdateShiftRequest }>({
      query: ({ id, body }) => ({
        url: `${endpoints.ScheduleApi}${id.toString()}`,  
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['schedule-list', 'schedule'], 
    }),

    deleteShift: builder.mutation<GetAllShiftsResponse, number>({
      query: id => ({
        url: `${endpoints.ScheduleApi}${id.toString()}`, 
        method: 'DELETE',
      }),
      invalidatesTags: ['schedule-list'],  
    }),
  }),
});

export const {
  useGetAllShiftsQuery,
  useGetShiftsByDateRangeQuery,
  useGetShiftByIdQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
} = scheduleApiSlice;
