import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import {
  MenuItemByIdResponse,
  Menu,
  MenuResponse,
  MenuRequest,
  MenuByIdResponse,
  MenuDishesResponse,
  MenuDishesParams,
  MenuSearchDishesParams, // <-- ADD THIS
} from './types';

export const menuApiSlice = createApi({
  reducerPath: 'menuApi',
  baseQuery,
  tagTypes: ['menu-list', 'menu', 'menu-dishes'],
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
        url: `${endpoints.MenuApi}${id}`,
        method: 'GET',
      }),
      providesTags: ['menu'],
    }),

    getMenuItemById: builder.query<MenuItemByIdResponse, number>({
      query: id => ({
        url: `${endpoints.MenuApi}${id}`,
        method: 'GET',
      }),
      providesTags: ['menu'],
    }),

    getMenuDishes: builder.query<MenuDishesResponse, MenuDishesParams>({
      query: ({
        menuId,
        categoryId,
        activeOnly = true,
        page = 0,
        size = 10,
      }) => ({
        url: `${endpoints.MenuApi}${menuId}/dishes`,
        method: 'GET',
        params: {
          ...(categoryId !== undefined && { categoryId }),
          activeOnly,
          page,
          size,
        },
      }),
      providesTags: ['menu-dishes'],
    }),
    getSearchMenuDishes: builder.query<
      MenuDishesResponse,
      MenuSearchDishesParams
    >({
      query: ({
        menuId,
        dishName,
        categoryId,
        activeOnly = true,
        page = 0,
        size = 10,
      }) => ({
        url: `${endpoints.MenuApi}${menuId}/dishes/search`,
        method: 'GET',
        params: {
          dishName,
          ...(categoryId !== undefined && { categoryId }),
          activeOnly,
          page,
          size,
        },
      }),
      providesTags: ['menu-dishes'],
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
        url: `${endpoints.MenuApi}${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['menu-list', 'menu'],
    }),

    deleteMenu: builder.mutation<MenuResponse, number>({
      query: id => ({
        url: `${endpoints.MenuApi}${id}`,
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
  useGetSearchMenuDishesQuery,
  useGetMenuDishesQuery,
  useCreateMenuMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
} = menuApiSlice;

export default menuApiSlice;
