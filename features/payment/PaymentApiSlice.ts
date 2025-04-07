import { endpoints } from '@/configs/endpoints';
import baseQuery from '@/features/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import {
    Payment,
    PaymentRequest,
    PaymentResponse,
    CashResponse,
    ApiResponse,
    QrCodeResponse,
    OrderItem,
    UpdateOrderItemQuantity,
    UpdateOrderItemResponse,
    CreateOrderItemRequest,
    PaginatedPaymentResponse,
    PaymentListParams,
    BillResponse
} from './types';

export const paymentApiSlice = createApi({
    reducerPath: 'paymentApi', // Tên reducer trong store
    baseQuery,
    tagTypes: ['payment-list', 'payment', 'order-items'], // Tag để quản lý cache và invalidate
    endpoints: (builder) => ({
        // Lấy thông tin bill
        getBill: builder.query<ApiResponse<BillResponse>, number>({
            query: (paymentId) => ({
                url: endpoints.PaymentApi + `bill/${paymentId}`,
                method: 'GET',
            }),
            providesTags: (result, error, paymentId) => [{ type: 'payment', id: paymentId }],
        }),

        // Lấy danh sách tất cả payments với phân trang
        getPayments: builder.query<ApiResponse<PaginatedPaymentResponse>, PaymentListParams>({
            query: (params = {}) => {
                const { page = 1, pageSize = 10, startDate, endDate } = params;
                
                // Xây dựng query string
                const queryParams = new URLSearchParams();
                queryParams.append('page', page.toString());
                queryParams.append('pageSize', pageSize.toString());
                
                if (startDate) {
                    queryParams.append('startDate', startDate);
                }
                
                if (endDate) {
                    queryParams.append('endDate', endDate);
                }
                
                return {
                    url: `${endpoints.PaymentApi}getAll?${queryParams.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: ['payment-list'], // Cache cho danh sách
        }),

        // Lấy payment theo ID
        getPaymentById: builder.query<ApiResponse<PaymentResponse>, number>({
            query: (id) => ({
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
                url: endpoints.PaymentApi + `${paymentId}` + '/checkout/cash', // /api/v1/payments/{id}/checkout/cash
                method: 'POST',
                params: { receivedAmount }, // Gửi receivedAmount trong body (dù backend dùng @RequestParam)
            }),
            invalidatesTags: (result, error, { paymentId }) => ['payment-list', { type: 'payment', id: paymentId }], // Làm mới danh sách và payment cụ thể
        }),

        // Lấy danh sách món ăn trong order qua orderId
        getOrderItemsInOrder: builder.query<ApiResponse<OrderItem[]>, number>({
            query: (orderId) => endpoints.PaymentApi + `order-items/${orderId}`,
            providesTags: (result, error, orderId) => [
                { type: 'order-items', id: orderId },
                'payment'
            ],
        }),

        // Tạo mã QR cho thanh toán chuyển khoản
        generateQrCode: builder.query<ApiResponse<QrCodeResponse>, number>({
            query: (paymentId) => ({
                url: endpoints.PaymentApi + `${paymentId}` + '/qr', // /api/v1/payments/{id}/qr
                method: 'GET',
            }),
            providesTags: (result, error, paymentId) => [{ type: 'payment', id: paymentId }], // Cache cho payment cụ thể
        }),

        // Cập nhật số lượng món ăn trong order
        updateOrderItemQuantity: builder.mutation<ApiResponse<UpdateOrderItemResponse>, { id: number, data: UpdateOrderItemQuantity }>({
            query: ({ id, data }) => {
                console.log(`Preparing API call to update order item ${id} with data:`, data);
                const url = `${endpoints.OrderItemApi}${id}`;
                console.log("Full URL:", url);
                return {
                    url,
                    method: 'PUT',
                    body: data,
                };
            },
            invalidatesTags: ['payment', 'order-items'],
        }),

        // Tạo order item mới
        createOrderItem: builder.mutation<ApiResponse<OrderItem>, CreateOrderItemRequest>({
            query: (data) => ({
                url: endpoints.OrderItemApi,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, data) => [
                'payment-list', 
                'payment',
                { type: 'order-items', id: data.orderId }
            ],
        }),

        // Hủy thanh toán
        cancelPayment: builder.mutation<ApiResponse<null>, number>({
            query: (paymentId) => ({
                url: endpoints.PaymentApi + `cancel/${paymentId}`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, paymentId) => [
                'payment-list',
                { type: 'payment', id: paymentId }
            ],
        }),
    }),
});

export const {
    useGetPaymentsQuery,
    useGetPaymentByIdQuery,
    useCreatePaymentMutation,
    useProcessCashPaymentMutation,
    useGenerateQrCodeQuery,
    useGetOrderItemsInOrderQuery,
    useUpdateOrderItemQuantityMutation,
    useCreateOrderItemMutation,
    useGetBillQuery,
    useCancelPaymentMutation,
} = paymentApiSlice;