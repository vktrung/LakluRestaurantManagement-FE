import { createApi } from '@reduxjs/toolkit/query/react';
import { 
  OrderResponse, 
  Order, 
  UpdateOrderStatusRequest, 
  UpdateOrderItemStatusRequest,
  CreateOrderRequest, 
  OrderItem,
  CreateOrderItemRequest
} from './types';
import baseQuery from '../baseQuery';
import { endpoints } from '@/configs/endpoints';
// import { Order, OrderResponse, UpdateOrderStatusRequest } from '@/features/order-cashier/types';

export const orderApiSlice = createApi({
  reducerPath: 'orderApi',
  baseQuery,
  tagTypes: ['Order', 'ReservationOrder'],
  endpoints: (builder) => ({
    // Get all orders
    getOrders: builder.query<OrderResponse, void>({
      query: () => '/api/v1/orders',
      providesTags: ['Order']
    }),

    // Get order by ID
    getOrderById: builder.query<Order, number>({
      query: (id) => `${endpoints.Order}${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }]
    }),

    // Get orders by reservation ID
    getOrdersByReservationId: builder.query<OrderResponse, number>({
      query: (reservationId) => `${endpoints.Order}reservation/${reservationId}`,
      providesTags: (result, error, reservationId) => [
        { type: 'ReservationOrder', id: reservationId },
        'Order'
      ]
    }),

    // Create a new order
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (newOrder) => ({
        url: endpoints.Order,
        method: 'POST',
        body: newOrder
      }),
      invalidatesTags: ['Order', 'ReservationOrder']
    }),

    // Update order status
    updateOrderStatus: builder.mutation<Order, { id: number, statusUpdate: UpdateOrderStatusRequest }>({
      query: ({ id, statusUpdate }) => ({
        url: `${endpoints.Order}${id}/status`,
        method: 'PUT',
        body: statusUpdate
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        'ReservationOrder'
      ]
    }),

    // Update order item status
    updateOrderItemStatus: builder.mutation<OrderItem, { orderItemId: number, statusUpdate: UpdateOrderItemStatusRequest }>({
      query: ({ orderItemId, statusUpdate }) => ({
        url: `${endpoints.Order}item/${orderItemId}/status`,
        method: 'PUT',
        body: statusUpdate
      }),
      invalidatesTags: ['Order', 'ReservationOrder']
    }),

    // Add item to order
    addOrderItem: builder.mutation<Order, { orderId: number, orderItem: CreateOrderItemRequest }>({
      query: ({ orderId, orderItem }) => ({
        url: `${endpoints.Order}${orderId}/item`,
        method: 'POST',
        body: orderItem
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'ReservationOrder'
      ]
    }),

    // Delete an order item
    deleteOrderItem: builder.mutation<void, number>({
      query: (orderItemId) => ({
        url: `${endpoints.Order}item/${orderItemId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Order', 'ReservationOrder']
    }),

    // Delete an order
    deleteOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `${endpoints.Order}${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Order', 'ReservationOrder']
    })
  })
});

// Export hooks for usage in components
export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrdersByReservationIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useUpdateOrderItemStatusMutation,
  useAddOrderItemMutation,
  useDeleteOrderItemMutation,
  useDeleteOrderMutation
} = orderApiSlice;
