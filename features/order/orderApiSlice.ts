import { createApi } from '@reduxjs/toolkit/query/react';
import { 
  OrderResponse, 
  Order, 
  UpdateOrderStatusRequest, 
  UpdateOrderItemStatusRequest,
  CreateOrderRequest, 
  OrderItem,
  CreateOrderItemRequest,
  OrderSplitRequest,
  MergeOrderRequest,
  AddOrderItemRequest,
  DeleteOrderResponse,
  BatchUpdateOrderItemStatusResponse,
  BatchUpdateOrderItemStatusRequest
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
    updateOrderItemQuantity: builder.mutation<OrderItem, { orderItemId: number, quantity: number }>({
  query: ({ orderItemId, quantity }) => ({
    url: `${endpoints.OrderItemApi}${orderItemId}`,
    method: 'PUT',
    body: { quantity }
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
        url: `${endpoints.OrderItemApi}${orderItemId}/status`,
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
    deleteOrder: builder.mutation<DeleteOrderResponse, number>({
      query: (id) => ({
        url: `${endpoints.Order}${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Order', 'ReservationOrder']
    }),

    // Split an order into two separate orders
    splitOrder: builder.mutation<OrderResponse, OrderSplitRequest>({
      query: (request) => ({
        url: `${endpoints.Order}${request.orderId}/split`,
        method: 'POST',
        body: request
      }),
      invalidatesTags: ['Order', 'ReservationOrder']
    }),

    // Merge multiple orders into a single order
    mergeOrders: builder.mutation<Order, MergeOrderRequest>({
      query: (request) => ({
        url: `${endpoints.Order}merge`,
        method: 'POST',
        body: request
      }),
      invalidatesTags: ['Order', 'ReservationOrder']
    }),

    // Create a new item for an existing order by order ID
    createNewItemByOrderId: builder.mutation<OrderItem, { orderId: number; newOrderItemRequest: AddOrderItemRequest }>({
        query: ({ orderId, newOrderItemRequest }) => ({
          url: `${endpoints.OrderItemApi}${orderId}`,
          method: 'POST',
          body: newOrderItemRequest
        }),
        invalidatesTags: (result, error, { orderId }) => [
          { type: 'Order', id: orderId },
          'ReservationOrder'
        ]
      }),

    // Delete an order item by its ID
    deleteOrderItemById: builder.mutation<void, number>({
      query: (orderItemId) => ({
        url: `${endpoints.OrderItemApi}${orderItemId}`, // Use the correct endpoint
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, orderItemId) => [
        // Invalidating specific order might be tricky without orderId
        // Invalidate the whole 'Order' list or potentially a specific tag if available
        'Order',
        'ReservationOrder' 
      ]
    }),
    // Update multiple order item statuses in batch
updateOrderItemStatusBatch: builder.mutation<BatchUpdateOrderItemStatusResponse, BatchUpdateOrderItemStatusRequest>({
  query: (batchRequest) => ({
    url: `/api/v1/order_items/status/batch`,
    method: 'PUT',
    body: {
      status: batchRequest.status,
      orderItemIds: batchRequest.orderItemIds
    }
  }),
  invalidatesTags: ['Order', 'ReservationOrder']
}),
    
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
  useDeleteOrderMutation,
  useSplitOrderMutation,
  useMergeOrdersMutation,
  useCreateNewItemByOrderIdMutation,
  useDeleteOrderItemByIdMutation,
  useUpdateOrderItemQuantityMutation,
  useUpdateOrderItemStatusBatchMutation,
} = orderApiSlice;
