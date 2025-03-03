import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react'; 
import { Category, CategoryResponse, CategoryRequest, CategoryByIdResponse } from './types';

export const categoryApiSlice = createApi({
  reducerPath: 'categoryApi',
  baseQuery,
  tagTypes: ['category-list', 'category'],
  endpoints: builder => ({
    getCategories: builder.query<CategoryResponse, void>({
      query: () => ({
        url: endpoints.CategoryApi,
        method: 'GET',
      }),
      providesTags: ['category-list'],
    }),

    getCategoryById: builder.query<CategoryByIdResponse, number>({
      query: id => ({
        url: `${endpoints.CategoryApi}${id.toString()}`, 
        method: 'GET',
      }),
      providesTags: ['category'],
    }),

    createCategory: builder.mutation<CategoryResponse, CategoryRequest>({
      query: body => ({
        url: endpoints.CategoryApi,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['category-list'],
    }),

    updateCategory: builder.mutation<CategoryResponse, { id: number; body: CategoryRequest }>({
      query: ({ id, body }) => ({
        url: `${endpoints.CategoryApi}${id.toString()}`, // Ensure id is a string in the URL
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['category-list', 'category'],
    }),

    deleteCategory: builder.mutation<CategoryResponse, number>({
      query: id => ({
        url: `${endpoints.CategoryApi}${id.toString()}`, 
        method: 'DELETE',// Ensure id is a string in the URL
      }),
      invalidatesTags: ['category-list'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApiSlice;