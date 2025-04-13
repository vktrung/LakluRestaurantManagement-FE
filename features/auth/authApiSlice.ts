// src/features/auth/authApiSlice.ts
import { endpoints } from '@/configs/endpoints';
import {
  ConfirmResetPasswordApiResponse,
  ConfirmResetPasswordCredentials,
  LoginApiResponse,
  LoginCredentials,
  LogoutCredentials,
  RegisterApiResponse,
  RegisterCredentials,
  RequestResetPasswordApiResponse,
  RequestResetPasswordCredentials,
  CheckUsernameRequest,
  CheckUsernameResponse,CheckPasswordRequest,CheckPasswordResponse,UserMeResponse
} from '@/features/auth/types';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';

const getAuthToken = () => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match('(^|;)\\s*auth_token\\s*=\\s*([^;]+)');
    const token = match ? match.pop() : null;
    console.log("Auth token from cookie:", token); 
    return token;
  }
  return null;
};

export const authApiSlice = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['userMe'],
  endpoints: builder => ({

    checkUsername: builder.mutation<CheckUsernameResponse, CheckUsernameRequest>({
      query: (credentials) => ({
        url: endpoints.login,
        method: 'POST',
        body: credentials,
     }),
    }),
    checkPassword: builder.mutation<CheckPasswordResponse, CheckPasswordRequest>({
      query: (credentials) => ({
        url: endpoints.login,
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation<LoginApiResponse, LoginCredentials>({
      query: credentials => ({
        url: endpoints.login,
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['userMe'],
    }),

    register: builder.mutation<RegisterApiResponse, RegisterCredentials>({
      query: userInfo => ({
        url: endpoints.register,
        method: 'POST',
        body: userInfo,
      }),
    }),

    requestResetPassword: builder.mutation<
      RequestResetPasswordApiResponse,
      RequestResetPasswordCredentials
    >({
      query: credentials => ({
        url: endpoints.requestResetPassword,
        method: 'POST',
        body: credentials,
      }),
    }),

    confirmResetPassword: builder.mutation<
      ConfirmResetPasswordApiResponse,
      ConfirmResetPasswordCredentials & { resetToken: string }
    >({
      query: ({ resetToken, ...credentials }) => {
        const searchParams = new URLSearchParams({ reset_token: resetToken });

        return {
          url: `${endpoints.confirmResetPassword}?${searchParams.toString()}`,
          method: 'POST',
          body: credentials,
        };
      },
    }),

    logout: builder.mutation<void, LogoutCredentials>({
      query: credentials => {
        return {
          url: endpoints.logout,
          method: 'POST',
          body: credentials,
        };
      },
      invalidatesTags: ['userMe'],
    }),
    getUserMe: builder.query<UserMeResponse, void>({
      query: () => {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Không tìm thấy token trong cookie!');
        }
        return {
          url: endpoints.authMe,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      },
      keepUnusedDataFor: 0,
      providesTags: ['userMe'],
    }),
  }),
});
export const {
  useLoginMutation,
  useRegisterMutation,
  useRequestResetPasswordMutation,
  useConfirmResetPasswordMutation,
  useLogoutMutation,
  useCheckUsernameMutation,
  useCheckPasswordMutation,
  useGetUserMeQuery,
} = authApiSlice;
