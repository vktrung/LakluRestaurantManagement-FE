import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from "@reduxjs/toolkit/query/react";
import { 
  CashRegisterResponse, 
  CashRegisterStartAmountRequest, 
  CashRegisterEndAmountRequest,
  CashRegisterWithdrawRequest,
  CashRegisterHistoryResponse,
  PaymentHistoryResponse
} from "./type";

export const cashRegisterApi = createApi({
  reducerPath: "cashRegisterApi",
  baseQuery,
  tagTypes: ['cash-register'],
  endpoints: (builder) => ({
    getTodayCashRegister: builder.query<CashRegisterResponse, void>({
      query: () => ({
        url: `${endpoints.CashRegisterApi}today`,
        method: "GET",
      }),
      providesTags: ['cash-register'],
    }),
    getTransactionHistory: builder.query<PaymentHistoryResponse, { startDate: string; endDate: string; page: number; size: number }>({
      query: (params) => ({
        url: `/api/v1/payment-history/page`,
        method: "GET",
        params: params,
      }),
    }),
    getCashRegisterHistory: builder.query<CashRegisterHistoryResponse, { startDate: string; endDate: string; page: number; size: number }>({
      query: (params) => ({
        url: `${endpoints.CashRegisterApi}search`,
        method: "GET",
        params: params,
      }),
    }),
    startCashRegister: builder.mutation<CashRegisterResponse, CashRegisterStartAmountRequest>({
      query: (data) => ({
        url: `${endpoints.CashRegisterApi}start-amount`,
        method: "POST",
        params: { amount: data.amount.toString(), notes: data.notes },
      }),
      invalidatesTags: ['cash-register'],
    }),
    endCashRegister: builder.mutation<CashRegisterResponse, CashRegisterEndAmountRequest>({
      query: (data) => ({
        url: `${endpoints.CashRegisterApi}end-amount`,
        method: "POST",
        params: { amount: data.amount.toString(), notes: data.notes },
      }),
      invalidatesTags: ['cash-register'],
    }),
    withdrawCashRegister: builder.mutation<CashRegisterResponse, CashRegisterWithdrawRequest>({
      query: (data) => ({
        url: `${endpoints.CashRegisterApi}withdraw`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['cash-register'],
    }),
  }),
});

export const { 
  useGetTodayCashRegisterQuery,
  useGetTransactionHistoryQuery,
  useGetCashRegisterHistoryQuery,
  useStartCashRegisterMutation,
  useEndCashRegisterMutation,
  useWithdrawCashRegisterMutation
} = cashRegisterApi;
