import { createApi } from '@reduxjs/toolkit/query/react';

import { OrderResponse, Order, UpdateOrderStatusRequest } from './types'; // Assuming types are in a separate file
import baseQuery from '../baseQuery';
import { endpoints } from '@/configs/endpoints';

export const orderApiSlice = createApi({
  reducerPath: 'orderApi',
  baseQuery,
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    // Get all orders
    getOrders: builder.query<OrderResponse, void>({
      query: () => endpoints.Order,
      providesTags: ['Order']
    }),

    // Get order by ID
    getOrderById: builder.query<Order, number>({
      query: (id) => `${endpoints.Order}/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }]
    }),

    // Create a new order
    createOrder: builder.mutation<OrderResponse, Partial<Order>>({
      query: (newOrder) => ({
        url: endpoints.Order,
        method: 'POST',
        body: newOrder
      }),
      invalidatesTags: ['Order']
    }),

    // Update order status
    updateOrderStatus: builder.mutation<OrderResponse, { id: number, statusUpdate: UpdateOrderStatusRequest }>({
      query: ({ id, statusUpdate }) => ({
        url: `${endpoints.Order}/${id}/status`,
        method: 'PUT',
        body: statusUpdate
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }]
    }),

    // Delete an order
    deleteOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `${endpoints.Order}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Order']
    })
  })
});

// Export hooks for usage in components
export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation
} = orderApiSlice;
