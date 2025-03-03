import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { Dish, DishByIdResponse, DishRequest, DishResponse } from './types';

export const dishApiSlice = createApi({
  reducerPath: 'dishApi',
  baseQuery,
  tagTypes: ['dish-list', 'dish'],
  endpoints: builder => ({
    getAllDishes: builder.query<DishResponse, void>({
      query: () => ({
        url: endpoints.DishApi,
        method: 'GET',
      }),
      providesTags: ['dish-list'],
    }),

    getDishById: builder.query<DishByIdResponse, number>({
      query: id => ({
        url: `${endpoints.DishApi}${id.toString()}`,
        method: 'GET',
      }),
      providesTags: ['dish'],
    }),

    createDish: builder.mutation<DishResponse, DishRequest>({
      query: body => ({
        url: endpoints.DishApi,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['dish-list'],
    }),

    updateDish: builder.mutation<
      DishResponse,
      { id: number; body: DishRequest }
    >({
      query: ({ id, body }) => ({
        url: `${endpoints.DishApi}${id.toString()}`,
        method: 'PUT',
        body, 
      }),
      invalidatesTags: ['dish-list', 'dish'],
    }),

    deleteDish: builder.mutation<DishResponse, number>({
      query: id => ({
        url: `${endpoints.DishApi}${id.toString()}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['dish-list'],
    }),
  }),
});

export const {
  useGetAllDishesQuery,
  useGetDishByIdQuery,
  useCreateDishMutation,
  useUpdateDishMutation,
  useDeleteDishMutation,
} = dishApiSlice;
