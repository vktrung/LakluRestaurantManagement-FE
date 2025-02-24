import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { EmployeeSalaryRequest, EmployeeSalaryResponse, ApiResponse } from './types'; 

export const salaryApiSlice = createApi({
  reducerPath: 'salaryApi',
  baseQuery,
  tagTypes: ['salary-list', 'salary'],
  endpoints: builder => ({
    getSalaryRates: builder.query<ApiResponse, void>({
      query: () => ({
        url: endpoints.SalaryRatesApi,
        method: 'GET',
      }),
      providesTags: ['salary-list'],
    }),

    getSalaryRateById: builder.query<EmployeeSalaryResponse, number>({
      query: id => ({
        url: `${endpoints.SalaryRatesApi}${id.toString()}`,
        method: 'GET',
      }),
      providesTags: ['salary'],
    }),

    createSalaryRate: builder.mutation<ApiResponse, EmployeeSalaryRequest>({
      query: body => ({
        url: endpoints.SalaryRatesApi,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['salary-list'],
    }),

    updateSalaryRate: builder.mutation<ApiResponse, { id: number; body: EmployeeSalaryRequest }>({
      query: ({ id, body }) => ({
        url: `${endpoints.SalaryRatesApi}${id.toString()}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['salary-list', 'salary'],
    }),

    deleteSalaryRate: builder.mutation<ApiResponse, number>({
      query: id => ({
        url: `${endpoints.SalaryRatesApi}${id.toString()}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['salary-list'],
    }),
  }),
});

export const {
  useGetSalaryRatesQuery,
  useGetSalaryRateByIdQuery,
  useCreateSalaryRateMutation,
  useUpdateSalaryRateMutation,
  useDeleteSalaryRateMutation,
} = salaryApiSlice;