//app/(private)/payment/components/PaymentList.tsx
import { PaymentResponse } from '@/features/payment/types';

interface PaymentListProps {
    payments: PaymentResponse[];
}

export function PaymentList({ payments }: PaymentListProps) {
    return (
        <div>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border p-2">Payment ID</th>
                        <th className="border p-2">Order ID</th>
                        <th className="border p-2">Tổng tiền</th>
                        <th className="border p-2">Số tiền nhận</th>
                        <th className="border p-2">Phương thức</th>
                        <th className="border p-2">Trạng thái</th>
                        <th className="border p-2">Ngày thanh toán</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => (
                        <tr key={payment.paymentId}>
                            <td className="border p-2">{payment.paymentId}</td>
                            <td className="border p-2">{payment.orderId}</td>
                            <td className="border p-2">{Number(payment.amountPaid).toLocaleString('vi-VN')} VND</td>
                            <td className="border p-2">{payment.receivedAmount ? Number(payment.receivedAmount).toLocaleString('vi-VN') : 'N/A'} VND</td>
                            <td className="border p-2">{payment.paymentMethod}</td>
                            <td className="border p-2">{payment.paymentStatus}</td>
                            <td className="border p-2">{new Date(payment.paymentDate).toLocaleDateString('vi-VN')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}