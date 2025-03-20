//app/(private)/payment/management/page.tsx
'use client';

import { useGetPaymentsQuery } from '@/features/payment/paymentApiSlice';
import { PaymentList } from '../components/PaymentList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function PaymentManagementPage() {
    const { data, error, isLoading } = useGetPaymentsQuery();
    const router = useRouter();

    if (isLoading) return <div>Đang tải...</div>;
    if (error) return <div>Có lỗi xảy ra: {JSON.stringify(error)}</div>;

    const payments = data?.data || [];

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
                    <PaymentList payments={payments} />
                </CardContent>
            </Card>
        </div>
    );
}