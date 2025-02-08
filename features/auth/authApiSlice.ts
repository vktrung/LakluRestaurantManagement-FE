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
} from '@/features/auth/types';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';

export const authApiSlice = createApi({
  reducerPath: 'authApi',
  baseQuery,
  endpoints: builder => ({
    login: builder.mutation<LoginApiResponse, LoginCredentials>({
      query: credentials => ({
        url: endpoints.login,
        method: 'POST',
        body: credentials,
      }),
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
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRequestResetPasswordMutation,
  useConfirmResetPasswordMutation,
  useLogoutMutation,
} = authApiSlice;
