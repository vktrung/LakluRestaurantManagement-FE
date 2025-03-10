import { endpoints } from '@/configs/endpoints';

import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { GetReservationResponse, Reservation } from './type';

export const reservationApiSlice = createApi({
  reducerPath: 'reservationApi',
  baseQuery,
  endpoints: (builder) => ({
    // Mutation cho tạo đặt chỗ
    createReservation: builder.mutation<Reservation, Reservation>({
      query: (reservation) => ({
        url: `${endpoints.ReservationApi}`,
        method: 'POST',
        body: reservation,
      }),
    }),
    // Query cho lấy danh sách đặt chỗ
    getReservations: builder.query<GetReservationResponse, void>({
      query: () => ({
        url: `${endpoints.ReservationApi}`, // Giả sử endpoint GET sử dụng cùng URL
        method: 'GET',
      }),
    }),
  }),
});

// Export hook của API slice
export const {
  useCreateReservationMutation,
  useGetReservationsQuery,
} = reservationApiSlice;