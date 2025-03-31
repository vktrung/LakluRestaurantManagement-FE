'use client';

import OrderCard from './OrderCard';
import { Order } from '@/features/order-cashier/types';

interface OrderListProps {
  orders: Order[];
  allOrders: Order[];
  status: 'pending' | 'processing' | 'completed';
  refetchOrders: () => void;
}

export default function OrderList({
  orders,
  allOrders,
  status,
  refetchOrders,
}: OrderListProps) {
  // Tính toán số thứ tự đơn hàng
  const getOrderNumber = (orderId: number) => {
    // Lấy tất cả các đơn hàng và sắp xếp theo ID giảm dần (ID cao nhất = đơn #1)
    const activeOrders = allOrders
      .filter(order => {
        // Chỉ lọc những đơn có ít nhất một món chưa hoàn thành và chưa bị hủy
        return order.orderItems.some(
          item =>
            item.statusLabel !== 'Đã hoàn thành' &&
            item.statusLabel !== 'Đã hủy',
        );
      })
      .sort((a, b) => b.id - a.id); // Sắp xếp ID giảm dần (cao nhất đầu tiên)

    // ID cao nhất sẽ là đơn #1, kế tiếp là #2, v.v.
    const index = activeOrders.findIndex(order => order.id === orderId);
    return index + 1; // Số thứ tự từ 1
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="border rounded p-6 text-center">
        <div className="text-zinc-500">Không có đơn hàng nào.</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map(order => (
        <div key={order.id} className="w-full">
          <OrderCard
            order={order}
            refetchOrders={refetchOrders}
            orderNumber={getOrderNumber(order.id)}
          />
        </div>
      ))}
    </div>
  );
}
