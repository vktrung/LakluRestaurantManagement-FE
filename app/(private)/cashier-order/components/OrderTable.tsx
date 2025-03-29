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

// Component con cho mỗi hàng trong bảng
const OrderRow = ({ order }: { order: Order }) => {
  const router = useRouter();

  // Log order data để kiểm tra giá trị của order, đặc biệt là statusLabel
  console.log('Order in OrderRow:', order);

  // Gọi useGetStaffByIdQuery cho staffId của order này
  const { data: staff, isLoading: isStaffLoading } = useGetStaffByIdQuery(
    order.staffId.toString(),
  );

  // Log staff data để kiểm tra thông tin nhân viên
  console.log('Staff data for order', order.id, ':', staff);

  const handleRowClick = () => {
    router.push(`/cashier-order/${order.id}`);
  };

  return (
    <TableRow
      onClick={handleRowClick}
      className="cursor-pointer hover:bg-gray-100"
    >
      <TableCell>Khách hàng {order.reservationId}</TableCell>
      <TableCell>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            order.statusLabel === 'Đang chờ'
              ? 'bg-yellow-100 text-yellow-700'
              : order.statusLabel === 'Đã xác nhận'
              ? 'bg-blue-100 text-blue-700'
              : order.statusLabel === 'Đã hoàn thành'
              ? 'bg-green-100 text-green-700'
              : order.statusLabel === 'Đã hủy'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700' 
          }`}
        >
          {order.statusLabel}
        </span>
      </TableCell>
      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
      <TableCell>
        {order.updatedAt
          ? new Date(order.updatedAt).toLocaleDateString()
          : 'Chưa cập nhật'}
      </TableCell>
      <TableCell>
        {isStaffLoading
          ? 'Đang tải...'
          : staff
          ? staff.data.username
          : `Nhân viên ${order.staffId}`}
      </TableCell>
    </TableRow>
  );
};

interface OrderTableProps {
  orders: Order[];
}

const OrderTable = ({ orders }: OrderTableProps) => {
  // Log toàn bộ orders được truyền vào OrderTable
  console.log('Orders in OrderTable:', orders);

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
                router.push(`/payment/${order.reservationId}`);
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
                      staff.data.username
                      
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
