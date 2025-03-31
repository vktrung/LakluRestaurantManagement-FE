import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { ActivityLogsResponse, GetActivityLogsParams } from './types';

export const activityLogApiSlice = createApi({
  reducerPath: 'activityLogApi',
  baseQuery,
  tagTypes: ['activity-logs'],
  endpoints: builder => ({
    getActivityLogs: builder.query<ActivityLogsResponse['data'], GetActivityLogsParams>({
      query: ({ startTime, endTime, page = 0, size = 10, sort = ['createdAt,desc'] }) => ({
        url: `${endpoints.ActivityLogs}/time-range`,
        method: 'GET',
        params: { startTime, endTime, page, size, sort },
      }),
      transformResponse: (response: ActivityLogsResponse) => response.data,
      providesTags: ['activity-logs'],
    }),
  }),
});

export const {
  useGetActivityLogsQuery,
} = activityLogApiSlice; 