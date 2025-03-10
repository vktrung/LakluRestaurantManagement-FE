import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import {
  ITable,
  IGetTablesResponse,
  IAddTableRequest,
  IUpdateTableRequest,
  IDeleteTableRequest,
} from './type';

export const tableApiSlice = createApi({
  reducerPath: 'tableApi',
  baseQuery,
  tagTypes: ['table-list', 'table'],
  endpoints: (builder) => ({
    getTables: builder.query<IGetTablesResponse, void>({
      query: () => ({
        url: `${endpoints.TableApi}`,
        method: 'GET',
      }),
      providesTags: ['table-list'],
    }),
    addTable: builder.mutation<ITable, IAddTableRequest>({
      query: (newTable) => ({
        url: `${endpoints.TableApi}`,
        method: 'POST',
        body: newTable,
      }),
      invalidatesTags: ['table-list'],
    }),
    updateTable: builder.mutation<ITable, IUpdateTableRequest>({
      query: ({ id, ...patch }) => ({
        url: `${endpoints.TableApi}/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'table', id: arg.id }],
    }),
    deleteTable: builder.mutation<{ message: string }, IDeleteTableRequest>({
      query: ({ id }) => ({
        url: `${endpoints.TableApi}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'table', id: arg.id }],
    }),
  }),
});

export const {
  useGetTablesQuery,
  useAddTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
} = tableApiSlice;