//app/(private)/payment/management/page.tsx
'use client';

import { useState } from 'react';
import { useGetPaymentsQuery } from '@/features/payment/PaymentApiSlice';
import { PaymentList } from '../components/PaymentList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function PaymentManagementPage() {
    const { data, error, isLoading } = useGetPaymentsQuery({});
    const router = useRouter();

    if (isLoading) return <div>Đang tải...</div>;
    if (error) return <div>Có lỗi xảy ra: {JSON.stringify(error)}</div>;

    // Đảm bảo dữ liệu phân trang được lấy đúng
    const paginatedResponse = data?.data || { payments: [], currentPage: 1, totalItems: 0, totalPages: 1 };
    const { payments, totalItems, totalPages } = paginatedResponse;

    const handlePageChange = (page: number) => {
     //   setCurrentPage(page);
    };

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Quản lý hóa đơn thanh toán</CardTitle>
                        <Button onClick={() => router.push('/dashboard')}>
                            Quay lại Dashboard
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <PaymentList payments={Array.isArray(data?.data) ? data.data : []} currentPage={0} totalPages={0} totalItems={0} onPageChange={function (page: number): void {
                        throw new Error('Function not implemented.');
                    } } />
                </CardContent>
            </Card>
        </div>
    );
}