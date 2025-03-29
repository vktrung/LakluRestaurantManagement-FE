import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../baseQuery';
import { Order, OrderResponse, UpdateOrderStatusRequest } from '@/features/order-cashier/types';

export const orderApiSlice = createApi({
  reducerPath: 'orderApi',
  baseQuery,
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    // Get all orders
    getOrders: builder.query<OrderResponse, void>({
      query: () => '/api/v1/orders',
      providesTags: ['Order']
    }),

    // Get order by ID
    getOrderById: builder.query<Order, number>({
      query: (id) => `/api/v1/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }]
    }),

    // Update order status
    updateOrderStatus: builder.mutation<OrderResponse, { id: number, statusUpdate: UpdateOrderStatusRequest }>({
      query: ({ id, statusUpdate }) => ({
        url: `/api/v1/orders/${id}/status`,
        method: 'PUT',
        body: statusUpdate
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order']
    })
  })
});

// Export hooks for usage in components
export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation
} = orderApiSlice;
