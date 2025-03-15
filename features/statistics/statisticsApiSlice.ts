import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { 
  TopDishesResponse, 
  RevenueTodayResponse, 
  WeeklyRevenueResponse,
  LastThreeMonthsRevenueResponse,
  LastThreeYearsRevenueResponse  
} from './types';

export const statisticsApiSlice = createApi({
  reducerPath: 'statisticsApi',
  baseQuery,
  tagTypes: ['top-dishes', 'revenue-today', 'weekly-revenue', 'last-three-months-revenue', 'last-three-years-revenue'],
  endpoints: builder => ({
    getTopSellingDishes: builder.query<TopDishesResponse, void>({
      query: () => ({
        url: `${endpoints.StatisticsApi}top-selling-dishes`,
        method: 'GET',
      }),
      providesTags: ['top-dishes'],
    }),

    getRevenueToday: builder.query<RevenueTodayResponse, void>({
      query: () => ({
        url: `${endpoints.StatisticsApi}revenue/today`,
        method: 'GET',
      }),
      providesTags: ['revenue-today'],
    }),

    getWeeklyRevenue: builder.query<WeeklyRevenueResponse, void>({
      query: () => ({
        url: `${endpoints.StatisticsApi}revenue/weekly`,
        method: 'GET',
      }),
      providesTags: ['weekly-revenue'],
    }),

    getLastThreeMonthsRevenue: builder.query<LastThreeMonthsRevenueResponse, void>({
      query: () => ({
        url: `${endpoints.StatisticsApi}revenue/last-three-months`,
        method: 'GET',
      }),
      providesTags: ['last-three-months-revenue'],
    }),

    getLastThreeYearsRevenue: builder.query<LastThreeYearsRevenueResponse , void>({
      query: () => ({
        url: `${endpoints.StatisticsApi}revenue/last-three-years`,
        method: 'GET',
      }),
      providesTags: ['last-three-years-revenue'],
    }),
  }),
});

export const {
  useGetTopSellingDishesQuery,
  useGetRevenueTodayQuery,
  useGetWeeklyRevenueQuery,
  useGetLastThreeMonthsRevenueQuery,
  useGetLastThreeYearsRevenueQuery
} = statisticsApiSlice;
