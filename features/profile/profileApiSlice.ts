import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { Profile, ApiResponse, ActivityLog } from '@/features/profile/types';

export interface ProfileResponse {
  data: Profile;
}

export interface ActivityLogsResponse {
  data: {
    content: ActivityLog[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface UpdateProfileRequest {
  fullName?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  hireDate?: string | null;
  bankAccount?: string | null;
  bankNumber?: string | null;
}

export interface GetActivityLogsParams {
  userId: number;
  page?: number;
  size?: number;
  sort?: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const profileApiSlice = createApi({
  reducerPath: 'profileApi',
  baseQuery,
  tagTypes: ['profile', 'activity-logs'],
  endpoints: builder => ({
    getMyProfile: builder.query<Profile, void>({
      query: () => ({
        url: endpoints.ProfileMe,
        method: 'GET',
      }),
      transformResponse: (response: ProfileResponse) => response.data,
      providesTags: ['profile'],
    }),

    updateProfile: builder.mutation<ApiResponse, { id: number; body: UpdateProfileRequest }>({
      query: ({ id, body }) => ({
        url: `${endpoints.ProfileApi}${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['profile'],
    }),

    uploadAvatar: builder.mutation<ApiResponse, FormData>({
      query: (formData) => ({
        url: endpoints.UploadAvatar,
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['profile'],
    }),

    changePassword: builder.mutation<ApiResponse, ChangePasswordRequest>({
      query: (credentials) => ({
        url: endpoints.ChangePassword,
        method: 'POST',
        body: credentials,
      }),
    }),

    getActivityLogs: builder.query<ActivityLogsResponse['data'], GetActivityLogsParams>({
      query: ({ userId, page = 0, size = 10, sort = ['createdAt,desc'] }) => ({
        url: `${endpoints.ActivityLogs}/${userId}`,
        method: 'GET',
        params: { page, size, sort },
      }),
      transformResponse: (response: ActivityLogsResponse) => response.data,
      providesTags: ['activity-logs'],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useChangePasswordMutation,
  useGetActivityLogsQuery,
} = profileApiSlice;
