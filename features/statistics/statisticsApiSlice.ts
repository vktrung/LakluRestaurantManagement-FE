import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { 
  TopDishesResponse, 
  RevenueTodayResponse, 
  WeeklyRevenueResponse,
  LastThreeMonthsRevenueResponse,
  LastThreeYearsRevenueResponse,
  TotalDishSoldResponse,
  DishDetailResponse
} from './types';

export const statisticsApiSlice = createApi({
  reducerPath: 'statisticsApi',
  baseQuery,
  tagTypes: ['top-dishes', 'revenue-today', 'weekly-revenue', 'last-three-months-revenue', 'last-three-years-revenue', 'top-dishes-last-hour', 'total-dish-sold', 'dish-details'],
  endpoints: builder => ({
    getTopSellingDishes: builder.query<TopDishesResponse, void>({
      query: () => ({
        url: `${endpoints.StatisticsApi}top-selling-dishes`,
        method: 'GET',
      }),
      providesTags: ['top-dishes'],
    }),

    getTopSellingDishesLastHour: builder.query<TopDishesResponse, void>({
      query: () => ({
        url: `${endpoints.StatisticsApi}top-selling-dishes/last-hour`,
        method: 'GET',
      }),
      providesTags: ['top-dishes-last-hour'],
    }),

    getTotalDishSold: builder.query<TotalDishSoldResponse, void>({
      query: () => ({
        url: `${endpoints.StatisticsApi}dishes/evening-to-morning`,
        method: 'GET',
      }),
      providesTags: ['total-dish-sold'],
    }),

    getDishDetails: builder.query<DishDetailResponse, void>({
      query: () => ({
        url: `${endpoints.StatisticsApi}dishes/evening-to-morning/details`,
        method: 'GET',
      }),
      providesTags: ['dish-details'],
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
  useGetTopSellingDishesLastHourQuery,
  useGetTotalDishSoldQuery,
  useGetDishDetailsQuery,
  useGetRevenueTodayQuery,
  useGetWeeklyRevenueQuery,
  useGetLastThreeMonthsRevenueQuery,
  useGetLastThreeYearsRevenueQuery
} = statisticsApiSlice;
