import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { MenuItem, MenuItemRequest, MenuItemResponse,MenuByIdResponse } from './types';

export const menuItemApiSlice = createApi({
  reducerPath: 'menuItemApi',
  baseQuery,
  tagTypes: ['menu-item-list', 'menu-item'],
  endpoints: builder => ({
    getAllMenuItems: builder.query<MenuItemResponse, void>({
      query: () => ({
        url: endpoints.MenuItemApi,
        method: 'GET',
      }),
      providesTags: ['menu-item-list'],
    }),

    getMenuItemById: builder.query<MenuByIdResponse, number>({
      query: id => ({
        url: `${endpoints.MenuItemApi}${id.toString()}`,
        method: 'GET',
      }),
      providesTags: ['menu-item'],
    }),

    createMenuItem: builder.mutation<MenuItemResponse, MenuItemRequest>({
      query: body => ({
        url: endpoints.MenuItemApi,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['menu-item-list'],
    }),

    updateMenuItem: builder.mutation<
      MenuItemResponse,
      { id: number; body: MenuItemRequest }
    >({
      query: ({ id, body }) => ({
        url: `${endpoints.MenuItemApi}${id.toString()}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['menu-item-list', 'menu-item'],
    }),

    deleteMenuItem: builder.mutation<MenuItemResponse, number>({
      query: id => ({
        url: `${endpoints.MenuItemApi}${id.toString()}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['menu-item-list'],
    }),
  }),
});

export const {
  useGetAllMenuItemsQuery,
  useGetMenuItemByIdQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
} = menuItemApiSlice;
