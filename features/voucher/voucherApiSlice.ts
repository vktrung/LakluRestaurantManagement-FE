import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { Voucher, VoucherRequest } from './type';

export const voucherApiSlice = createApi({
  reducerPath: 'voucherApi',
  baseQuery,
  tagTypes: ['voucher-list', 'voucher'],
  endpoints: builder => ({
    getAllVouchers: builder.query<Voucher[], void>({
      query: () => ({
        url: '/api/v1/vouchers/getAll',
        method: 'GET',
      }),
      providesTags: ['voucher-list'],
      transformResponse: (response: any) => response.data,
    }),

    getVoucherById: builder.query<Voucher, number>({
      query: id => ({
        url: `/api/v1/vouchers/${id}`,
        method: 'GET',
      }),
      providesTags: ['voucher'],
      transformResponse: (response: any) => response.data,
    }),

    searchVoucherByCode: builder.query<Voucher[], string>({
      query: (code) => ({
        url: `/api/v1/vouchers/search?code=${code}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data,
    }),

    searchVoucherByStatus: builder.query<Voucher[], string>({
      query: (status) => ({
        url: `/api/v1/vouchers/searchByStatus?status=${status}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data,
    }),

    createVoucher: builder.mutation<Voucher, VoucherRequest>({
      query: body => ({
        url: '/api/v1/vouchers/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['voucher-list'],
      transformResponse: (response: any) => response.data,
    }),

    updateVoucher: builder.mutation<Voucher, { id: number; body: VoucherRequest }>({
      query: ({ id, body }) => ({
        url: `/api/v1/vouchers/update/${id}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['voucher-list', 'voucher'],
      transformResponse: (response: any) => response.data,
    }),

    deleteVoucher: builder.mutation<void, number>({
      query: id => ({
        url: `/api/v1/vouchers/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['voucher-list'],
    }),
  }),
});

export const {
  useGetAllVouchersQuery,
  useGetVoucherByIdQuery,
  useSearchVoucherByCodeQuery,
  useSearchVoucherByStatusQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
} = voucherApiSlice;
