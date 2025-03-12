import { endpoints } from '@/configs/endpoints';

import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { GetReservationResponse, Reservation, UpdateReservationRequest } from './type';

export const reservationApiSlice = createApi({
  reducerPath: 'reservationApi',
  baseQuery,
  tagTypes: ['reservation-list', 'reservation'],
  endpoints: (builder) => ({
    // Mutation tạo đặt chỗ mới
    createReservation: builder.mutation<Reservation, Reservation>({
      query: (reservation) => ({
        url: `${endpoints.ReservationApi}`,
        method: 'POST',
        body: reservation,
      }),
      invalidatesTags: ['reservation-list'],
    }),
    // Query lấy danh sách đặt chỗ
    getReservations: builder.query<GetReservationResponse, void>({
      query: () => ({
        url: `${endpoints.ReservationApi}`,
        method: 'GET',
      }),
      providesTags: ['reservation-list'],
    }),
    // Mutation sửa đặt chỗ (update)
    updateReservation: builder.mutation<Reservation, UpdateReservationRequest>({
      query: ({ id, ...changes }) => ({
        url: `${endpoints.ReservationApi}${id}`,
        method: 'PUT',
        body: changes,
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
  useCreateReservationMutation,
  useGetReservationsQuery,
  useUpdateReservationMutation,
} = reservationApiSlice;