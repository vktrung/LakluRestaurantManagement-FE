import { endpoints } from '@/configs/endpoints';

import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import {  
  GetReservationsResponse, 
  Reservation, 
  ReservationDetail, 
  ReservationResponse, 
  GetTablesByDateResponse, 
  MergeTableRequest, 
  MergeTableResponse, 
  GetReservationByIdResponse,
  RemoveTableRequest,
  RemoveTableResponse,
  AddTableRequest,
  AddTableResponse 
} from './type';

export const reservationApiSlice = createApi({
  reducerPath: 'reservationApi',
  baseQuery,
  tagTypes: ['reservation-list', 'reservation'],
  endpoints: (builder) => ({
    // Mutation tạo đặt chỗ mới
     createReservation: builder.mutation<{ message: string }, Reservation>({
      query: (newReservation) => ({
        url: `${endpoints.ReservationApi}`,
        method: 'POST',
        body: newReservation,
      }),
      invalidatesTags: ['reservation-list'],
    }),
    // Query lấy danh sách đặt chỗ
       getReservations: builder.query<GetReservationsResponse, void>({
      query: () => ({
        url: `${endpoints.ReservationApi}`,
        method: 'GET',
      }),
      providesTags: ['reservation-list'],
    }),
    // Mutation sửa đặt chỗ (update)
      updateReservation: builder.mutation<{ message: string }, { id: number; data: Reservation }>({
      query: ({ id, data }) => ({
        url: `${endpoints.ReservationApi}${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'reservation', id: arg.id },
        'reservation-list',
      ],
    }),
    // Query lấy danh sách bàn theo ngày
    getTablesByDate: builder.query<GetTablesByDateResponse, string>({
      query: (date) => ({
        url: `${endpoints.TableApi}by-date?date=${date}`,
        method: 'GET',
      }),
    }),
    // Query lấy thông tin đặt bàn theo ID
    getReservationById: builder.query<GetReservationByIdResponse, number>({
      query: (id) => ({
        url: `${endpoints.ReservationApi}${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'reservation', id }],
      transformResponse: (response: GetReservationByIdResponse) => response,
    }),
    // Mutation cập nhật bàn (sử dụng PUT /reservations/{id})
    mergeOrSplitTables: builder.mutation<MergeTableResponse, MergeTableRequest>({
      query: (request) => ({
        url: `${endpoints.ReservationApi}${request.reservationId}`,
        method: 'PUT',
        body: {
          tableIds: request.tableIds,
          numberOfPeople: request.numberOfPeople
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'reservation', id: arg.reservationId },
        'reservation-list',
      ],
    }),
    // Mutation xóa bàn khỏi đặt bàn (sử dụng DELETE /reservations/{reservation_id}/tables)
    removeTablesFromReservation: builder.mutation<RemoveTableResponse, { reservationId: number; request: RemoveTableRequest }>({
      query: ({ reservationId, request }) => ({
        url: `${endpoints.ReservationApi}${reservationId}/tables`,
        method: 'DELETE',
        body: request,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'reservation', id: arg.reservationId },
        'reservation-list',
      ],
    }),
    // Mutation thêm bàn vào đặt bàn (sử dụng POST /reservations/{reservation_id}/tables)
    addTablesToReservation: builder.mutation<AddTableResponse, { reservationId: number; request: AddTableRequest }>({
      query: ({ reservationId, request }) => ({
        url: `${endpoints.ReservationApi}${reservationId}/tables`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'reservation', id: arg.reservationId },
        'reservation-list',
      ],
    }),
  }),
});

// Export các hook để sử dụng trong component
export const {
  useGetReservationsQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useGetTablesByDateQuery,
  useGetReservationByIdQuery,
  useMergeOrSplitTablesMutation,
  useRemoveTablesFromReservationMutation,
  useAddTablesToReservationMutation
} = reservationApiSlice;