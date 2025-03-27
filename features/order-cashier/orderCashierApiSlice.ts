// orderApiSlice.ts

import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { OrderResponse,OrderResponseId,CreateOrderItemResponse,CreateOrderItemRequest ,GetOrdersParams} from './types';

export const orderCashierApiSlice = createApi({
  reducerPath: 'orderApi',
  baseQuery,
  tagTypes: ['order-list', 'order'],
  endpoints: builder => ({
    getOrders: builder.query<OrderResponse, GetOrdersParams | void>({
      query: (params) => {
        if (!params) {
          return {
            url: '/api/v1/order/',
            method: 'GET',
          };
        }

        const queryParams = new URLSearchParams();
        if (params.date) queryParams.append('date', params.date);
        if (params.status) queryParams.append('status', params.status);
        if (params.sort) queryParams.append('sort', params.sort);

        return {
          url: `/api/v1/order/?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['order-list'],
    }),


    getOrderById: builder.query<OrderResponseId, number>({
      query: id => ({
        url: `${endpoints.OrderCashierApi}${id.toString()}`,
        method: 'GET',
      }),
      providesTags: ['order'],
    }),
   

  }),
});

// Export các hooks để sử dụng trong components
export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
} = orderCashierApiSlice;

export default orderCashierApiSlice;