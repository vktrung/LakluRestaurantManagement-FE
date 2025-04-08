// features/table-order/tableOrderApiSlice.ts
import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { CreateTableOrderRequest, CreateTableOrderResponse } from './types';

// Define the API slice for table orders
export const tableOrderApiSlice = createApi({
  reducerPath: 'tableOrderApi',
  baseQuery,
  tagTypes: ['TableOrder'], // For cache invalidation
  endpoints: (builder) => ({
    // Mutation for creating a table order
    createTableOrder: builder.mutation<CreateTableOrderResponse, CreateTableOrderRequest>({
      query: (tableOrderData) => ({
        url: `${endpoints.Table_Order}`,
        method: 'POST',
        body: tableOrderData,
      }),
      invalidatesTags: ['TableOrder'], // Invalidate cache to refetch related data
    }),
  }),
});

// Export the hook for usage in components
export const { useCreateTableOrderMutation } = tableOrderApiSlice;