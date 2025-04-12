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
  // Lọc các đơn có ít nhất một món chưa hoàn thành và có requiresPreparation = true
  const activeOrders = orders.filter(order => {
    const filteredItems = order.orderItems.filter(
      item => item.dish?.requiresPreparation === true
    );
    return filteredItems.some(
      item =>
        item.statusLabel !== 'Đã hoàn thành' &&
        item.statusLabel !== 'Đã hủy' &&
        item.statusLabel !== 'Đã giao'
    );
  });

  // Sắp xếp đơn theo thời gian tạo, đơn mới nhất lên đầu
  const sortedOrders = [...activeOrders].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  console.log('Sorted orders:', sortedOrders); // Debug

  if (!sortedOrders || sortedOrders.length === 0) {
    return (
      <div className="border rounded p-6 text-center">
        <div className="text-zinc-500">Không có đơn hàng nào.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {sortedOrders.map(order => (
        <div
          key={order.id}
          className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
        >
          <OrderCard
            order={order}
            refetchOrders={refetchOrders}
            orderNumber={order.id}
          />
        </div>
      ))}
    </div>
  );
}