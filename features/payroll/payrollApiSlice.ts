import { createApi } from '@reduxjs/toolkit/query/react';
import { PayslipResponse } from './types';
import baseQuery from '@/features/baseQuery';
import { endpoints } from '@/configs/endpoints';

export const payrollApiSlice = createApi({
  reducerPath: 'payrollApi',
  baseQuery,
  tagTypes: ['payslips'],
  endpoints: (builder) => ({
    getPayslips: builder.query<PayslipResponse, string | undefined>({
      query: (salaryMonth) => ({
        url: `${endpoints.PayrollApi}${salaryMonth ? salaryMonth : ''}`,
        method: 'GET',
      }),
      providesTags: ['payslips'],
    }),
    getPayslipById: builder.query<PayslipResponse, number>({
      query: (id) => ({
        url: `${endpoints.PayrollApi}detail/${id}`,
        method: 'GET',
      }),
      providesTags: ['payslips'],
    }),
    generatePayslips: builder.mutation<PayslipResponse, string>({
      query: (salaryMonth) => ({
        url: `${endpoints.PayrollApi}generate`,
        method: 'POST',
        body: { salaryMonth },
      }),
      invalidatesTags: ['payslips'],
    }),
    updatePayslips: builder.mutation<PayslipResponse, string>({
      query: (salaryMonth) => ({
        url: `${endpoints.PayrollApi}${salaryMonth}`,
        method: 'POST',
      }),
      invalidatesTags: ['payslips'],
    }),
  }),
});

export const {
  useGetPayslipsQuery,
  useGetPayslipByIdQuery,
  useGeneratePayslipsMutation,
  useUpdatePayslipsMutation,
} = payrollApiSlice; 