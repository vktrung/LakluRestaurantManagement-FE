import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import {MenuItemByIdResponse, Menu, MenuResponse, MenuRequest, MenuByIdResponse } from './types';

export const menuApiSlice = createApi({
  reducerPath: 'menuApi',
  baseQuery,
  tagTypes: ['menu-list', 'menu'],
  endpoints: builder => ({
    getMenus: builder.query<MenuResponse, void>({
      query: () => ({
        url: endpoints.MenuApi,
        method: 'GET',
      }),
      providesTags: ['menu-list'],
    }),

    getMenuById: builder.query<MenuByIdResponse, number>({
      query: id => ({
        url: `${endpoints.MenuApi}${id.toString()}`,
        method: 'GET',
      }),
      providesTags: ['menu'],
    }),
    getMenuItemById: builder.query<MenuItemByIdResponse, number>({
      query: id => ({
        url: `${endpoints.MenuApi}${id.toString()}`,
        method: 'GET',
      }),
      providesTags: ['menu'],
    }),
    createMenu: builder.mutation<MenuResponse, MenuRequest>({
      query: body => ({
        url: endpoints.MenuApi,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['menu-list'],
    }),

    updateMenu: builder.mutation<
      MenuResponse,
      { id: number; body: MenuRequest }
    >({
      query: ({ id, body }) => ({
        url: `${endpoints.MenuApi}${id.toString()}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['menu-list', 'menu'],
    }),

    deleteMenu: builder.mutation<MenuResponse, number>({
      query: id => ({
        url: `${endpoints.MenuApi}${id.toString()}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['menu-list'],
    }),
  }),
});

export const {
  useGetMenusQuery,
  useGetMenuByIdQuery,
  useGetMenuItemByIdQuery,
  useCreateMenuMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
} = menuApiSlice;

export default menuApiSlice;
