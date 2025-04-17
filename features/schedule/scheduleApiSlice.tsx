import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import {
  CheckinSuccessResponse,
  CheckInSuccessRequest,
  GetShiftById,
  AddShiftRequest,
  UpdateShiftRequest,
  GetAllShiftsResponse,
  GetShiftsByDateRangeResponse,
  GetShiftsByDateRangeRequest,
  CheckinResponse,
  GetShiftsByStaffAndDateRangeRequest,
  DeleteShiftsResponse,
  CloneScheduleBetweenWeeksRequest,
  CloneScheduleResponse,
} from './types';

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

    getShiftsByDateRange: builder.query<
      GetShiftsByDateRangeResponse,
      GetShiftsByDateRangeRequest
    >({
      query: ({ startDate, endDate }) => ({
        url: endpoints.ScheduleApi + 'by-date-range',
        params: { startDate, endDate },
      }),
      providesTags: (result, error, arg) => [
        { type: 'schedule-list', id: arg.startDate + '_' + arg.endDate },
      ],
      keepUnusedDataFor: 0,
    }),

    getShiftsByStaffAndDateRange: builder.query<
      GetShiftsByDateRangeResponse,
      GetShiftsByStaffAndDateRangeRequest
    >({
      query: ({ staffId, startDate, endDate }) => ({
        url: `${endpoints.ScheduleApi}staff/${staffId}/date-range`,
        params: { startDate, endDate },
      }),
      providesTags: (result, error, arg) => [
        {
          type: 'schedule-list',
          id: `${arg.staffId}_${arg.startDate}_${arg.endDate}`,
        },
      ],
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

    createShiftAttend: builder.mutation<
      CheckinSuccessResponse,
      CheckInSuccessRequest
    >({
      query: body => ({
        url: endpoints.ScheduleApi + 'schedule-check-in',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['schedule-list'],
    }),

    CreateQr: builder.mutation<CheckinResponse, number>({
      query: id => ({
        url: `${endpoints.ScheduleApi}check-in-qr-code/${id.toString()}`,
        method: 'POST',
        responseHandler: async response => {
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('image/png')) {
            return response.blob();
          } else {
            return response.json();
          }
        },
        headers: {
          Accept: 'image/png',
        },
      }),
      transformResponse: (
        response: Blob | { message: string; httpStatus: number },
      ) => {
        if (response instanceof Blob) {
          const qrImageUrl = URL.createObjectURL(response);
          return { url: qrImageUrl };
        }
        return response;
      },
      invalidatesTags: ['schedule-list'],
    }),

    createShiftCheckout: builder.mutation<
      CheckinSuccessResponse,
      CheckInSuccessRequest
    >({
      query: body => ({
        url: endpoints.ScheduleApi + 'schedule-check-out',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['schedule-list'],
    }),

    CreateQrCheckout: builder.mutation<CheckinResponse, number>({
      query: id => ({
        url: `${endpoints.ScheduleApi}check-out-qr-code/${id.toString()}`,
        method: 'POST',
        responseHandler: async response => {
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('image/png')) {
            return response.blob();
          } else {
            return response.json();
          }
        },
        headers: {
          Accept: 'image/png',
        },
      }),

      transformResponse: (
        response: Blob | { message: string; httpStatus: number },
      ) => {
        if (response instanceof Blob) {
          const qrImageUrl = URL.createObjectURL(response);
          return { url: qrImageUrl };
        }
        return response;
      },
      invalidatesTags: ['schedule-list'],
    }),

    updateShift: builder.mutation<
      GetAllShiftsResponse,
      { id: number; body: UpdateShiftRequest }
    >({
      query: ({ id, body }) => ({
        url: `${endpoints.ScheduleApi}${id.toString()}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['schedule-list', 'schedule'],
    }),

    deleteShift: builder.mutation<DeleteShiftsResponse, number>({
      query: id => ({
        url: `${endpoints.ScheduleApi}${id.toString()}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['schedule-list'],
    }),

    cloneScheduleBetweenWeeks: builder.mutation<
      CloneScheduleResponse,
      CloneScheduleBetweenWeeksRequest
    >({
      query: params => ({
        url: endpoints.ScheduleApi + 'clone-between-weeks',
        method: 'POST',
        params: {
          sourceWeek: params.sourceWeek,
          targetWeek: params.targetWeek,
          updateShiftType: params.updateShiftType,
          overwriteExisting: params.overwriteExisting,
        },
      }),
      invalidatesTags: ['schedule-list'],
    }),
  }),
});

export const {
  useGetAllShiftsQuery,
  useGetShiftsByDateRangeQuery,
  useGetShiftsByStaffAndDateRangeQuery,
  useGetShiftByIdQuery,
  useCreateShiftMutation,
  useCreateShiftAttendMutation,
  useCreateQrMutation,
  useCreateShiftCheckoutMutation,
  useCreateQrCheckoutMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
  useCloneScheduleBetweenWeeksMutation,
} = scheduleApiSlice;
