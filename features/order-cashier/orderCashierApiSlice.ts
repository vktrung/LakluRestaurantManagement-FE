// orderApiSlice.ts

import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { OrderResponse,OrderResponseId,CreateOrderItemResponse,CreateOrderItemRequest ,GetOrdersParams, UpdateOrderStatusRequest, UpdateOrderItemStatusRequest, OrderItemResponse} from './types';

export const orderCashierApiSlice = createApi({
  reducerPath: 'orderCashier',
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
   

    // Cập nhật trạng thái đơn hàng
    updateOrderStatus: builder.mutation<any, { id: number, data: UpdateOrderStatusRequest }>({
      query: ({ id, data }) => ({
        url: `${endpoints.OrderCashierApi}${id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['order-list'],
    }),

    // Cập nhật trạng thái món ăn trong đơn hàng
    updateOrderItemStatus: builder.mutation<any, { id: number, data: UpdateOrderItemStatusRequest }>({
      query: ({ id, data }) => ({
        url: `${endpoints.OrderItemApi}status/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['order-list'],
    }),

    // Lấy thông tin chi tiết của order item
    getOrderItemById: builder.query<OrderItemResponse, number>({
      query: id => ({
        url: `${endpoints.OrderItemApi}${id}`,
        method: 'GET',
      }),
      providesTags: ['order-list'],
    }),
  }),
});

// Export các hooks để sử dụng trong components
export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderItemStatusMutation,
  useGetOrderItemByIdQuery,
} = orderCashierApiSlice;

export default orderCashierApiSlice;