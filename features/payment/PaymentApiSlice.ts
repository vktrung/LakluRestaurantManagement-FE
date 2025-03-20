//features/payment/paymentApiSlice.ts
import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import {
    Payment,
    PaymentRequest,
    PaymentResponse,
    CashResponse,
    ApiResponse,
    QrCodeResponse
} from './types';

export const paymentApiSlice = createApi({
    reducerPath: 'paymentApi', // Tên reducer trong store
    baseQuery,
    tagTypes: ['payment-list', 'payment'], // Tag để quản lý cache và invalidate
    endpoints: (builder) => ({
        // Lấy danh sách tất cả payments
        getPayments: builder.query<ApiResponse<PaymentResponse[]>, void>({
            query: () => ({
                url: endpoints.PaymentApi + 'getAll', // /api/v1/payments/getAll
                method: 'GET',
            }),
            providesTags: ['payment-list'], // Cache cho danh sách
        }),

        // Lấy payment theo ID
        getPaymentById: builder.query<ApiResponse<PaymentResponse>, number>({
            query: (id) => ({
                // url: `${endpoints.PaymentApi}/${id}`, // /api/v1/payments/{id}
                url: endpoints.PaymentApi + `${id}`, // /api/v1/payments/{id}
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'payment', id }], // Cache cho payment cụ thể
        }),

        // Tạo payment mới
        createPayment: builder.mutation<ApiResponse<PaymentResponse>, PaymentRequest>({
            query: (body) => ({
                url: endpoints.PaymentApi + 'create', // /api/v1/payments/create
                method: 'POST',
                body,
            }),
            invalidatesTags: ['payment-list'], // Làm mới danh sách sau khi tạo
        }),

        // Xử lý thanh toán tiền mặt
        processCashPayment: builder.mutation<ApiResponse<CashResponse>, { paymentId: number; receivedAmount: number }>({
            query: ({ paymentId, receivedAmount }) => ({
                //url: `${endpoints.PaymentApi}/${paymentId}/checkout/cash`, // /api/v1/payments/{id}/checkout/cash
                url: endpoints.PaymentApi + `${paymentId}` + '/checkout/cash', // /api/v1/payments/{id}/checkout/cash

                method: 'POST',
                params: { receivedAmount }, // Gửi receivedAmount trong body (dù backend dùng @RequestParam)
            }),
            invalidatesTags: (result, error, { paymentId }) => ['payment-list', { type: 'payment', id: paymentId },], // Làm mới danh sách và payment cụ thể
        }),

        // Tạo mã QR cho thanh toán chuyển khoản
        generateQrCode: builder.query<ApiResponse<QrCodeResponse>, number>({
            query: (paymentId) => ({
                // url: `${endpoints.PaymentApi}/${paymentId}/qr`, // /api/v1/payments/{id}/qr
                url: endpoints.PaymentApi + `${paymentId}` +'/qr', // /api/v1/payments/{id}/qr
                method: 'GET',
            }),
            providesTags: (result, error, paymentId) => [{ type: 'payment', id: paymentId }], // Cache cho payment cụ thể
        }),
    }),
});

export const {
    useGetPaymentsQuery,
    useGetPaymentByIdQuery,
    useCreatePaymentMutation,
    useProcessCashPaymentMutation,
    useGenerateQrCodeQuery,
} = paymentApiSlice;