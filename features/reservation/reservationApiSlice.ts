import { endpoints } from '@/configs/endpoints';

import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import {  GetReservationsResponse, Reservation, ReservationDetail, ReservationResponse } from './type';

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
  }),
});

// Export các hook để sử dụng trong component
export const {
  useGetReservationsQuery,
   useCreateReservationMutation,
  useUpdateReservationMutation,
} = reservationApiSlice;