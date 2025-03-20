// orderApiSlice.ts

import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { OrderResponse,OrderResponseId,CreateOrderItemResponse,CreateOrderItemRequest } from './types';

export const orderCashierApiSlice = createApi({
  reducerPath: 'orderApi',
  baseQuery,
  tagTypes: ['order-list', 'order'],
  endpoints: builder => ({
    // Endpoint để lấy danh sách tất cả đơn hàng
    getOrders: builder.query<OrderResponse, void>({
      query: () => ({
        url: endpoints.OrderCashierApi, 
        method: 'GET',
      }),
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