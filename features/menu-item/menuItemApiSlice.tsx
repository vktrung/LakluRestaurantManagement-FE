import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import {
  MenuItem,
  MenuItemRequest,
  MenuItemResponse,
  MenuByIdResponse,
  UpdateMenuItemStatusResponse,
  GetMenuItemsByMenuIdResponse,
} from './types';

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

    getMenuItemsByMenuId: builder.query<
      GetMenuItemsByMenuIdResponse,
      { id: number; categoryId?: number; activeOnly?: boolean; page?: number; size?: number }
    >({
      query: ({ id, categoryId, activeOnly, page = 0, size = 10 }) => {
        const params: Record<string, string | number | boolean> = {
          page,
          size,
        };
        
        if (categoryId !== undefined) {
          params.categoryId = categoryId;
        }
        
        if (activeOnly !== undefined) {
          params.activeOnly = activeOnly;
        }
        
        return {
          url: `${endpoints.MenuApi}${id.toString()}/dishes`,
          method: 'GET',
          params,
        };
      },
      providesTags: (result, error, arg) => [
        { type: 'menu-item-list', id: `menu_${arg.id}` },
      ],
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
    updateMenuItemStatus: builder.mutation<
      UpdateMenuItemStatusResponse,
      { id: number }
    >({
      query: ({ id }) => ({
        url: `${endpoints.MenuItemApi}${id.toString() + '/toggle-status'}`,
        method: 'GET',
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
  useGetMenuItemsByMenuIdQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useUpdateMenuItemStatusMutation,
} = menuItemApiSlice;
