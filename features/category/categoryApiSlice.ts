// category/categoryApiSlice.ts
import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react'; // Remove FetchBaseQueryError import unless you need it here
import { Category, CategoryResponse, CategoryRequest } from './types';

export const categoryApiSlice = createApi({
  reducerPath: 'categoryApi',
  baseQuery,
  tagTypes: ['category-list', 'category'],
  endpoints: builder => ({
    // Read: Get all categories (list)
    getCategories: builder.query<CategoryResponse, void>({
      query: () => ({
        url: endpoints.CategoryApi,
        method: 'GET',
      }),
      providesTags: ['category-list'],
    }),

    // Read: Get category by ID
    getCategoryById: builder.query<Category, number>({
      query: id => ({
        url: `${endpoints.CategoryApi}${id.toString()}`, 
        method: 'GET',
      }),
      providesTags: ['category'],
    }),

    // Create: Add a new category
    createCategory: builder.mutation<CategoryResponse, CategoryRequest>({
      query: body => ({
        url: endpoints.CategoryApi,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['category-list'],
    }),

    // Update: Update an existing category
    updateCategory: builder.mutation<CategoryResponse, { id: number; body: CategoryRequest }>({
      query: ({ id, body }) => ({
        url: `${endpoints.CategoryApi}${id.toString()}`, // Ensure id is a string in the URL
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['category-list', 'category'],
    }),

    // Delete: Remove a category
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