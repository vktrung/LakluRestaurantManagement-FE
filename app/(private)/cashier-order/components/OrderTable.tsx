// cashier-order/components/OrderTable.tsx

'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Order } from '@/features/order-cashier/types';
import { useGetStaffByIdQuery } from '@/features/staff/staffApiSlice';

interface OrderTableProps {
  orders: Order[];
}

const OrderTable = ({ orders }: OrderTableProps) => {
  const router = useRouter();

  return (
    <div className="w-full overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Trạng Thái</TableHead>
            <TableHead>Bắt Đầu</TableHead>
            <TableHead>Kết Thúc</TableHead>
            <TableHead>Người phụ trách</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Không có đơn hàng
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order: Order) => {
              const { data: staff, isLoading: isStaffLoading } = useGetStaffByIdQuery(
                order.staffId.toString()
              );

              const handleRowClick = () => {
                router.push(`/cashier-order/${order.reservationId}`);
              };

              return (
                <TableRow
                  key={order.reservationId}
                  onClick={handleRowClick}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <TableCell>Khách hàng {order.reservationId}</TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        order.statusLabel === 'Đang chờ'
                          ? 'bg-yellow-100 text-yellow-700'
                          : order.statusLabel === 'Hoàn thành'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {order.statusLabel}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {order.updatedAt
                      ? new Date(order.updatedAt).toLocaleDateString()
                      : 'Chưa cập nhật'}
                  </TableCell>
                  <TableCell>
                    {isStaffLoading ? (
                      'Đang tải...'
                    ) : staff ? (
                      staff.username
                    ) : (
                      `Nhân viên ${order.staffId}`
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderTable;