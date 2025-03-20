// cashier-order/components/OrderList.tsx
'use client';
import { useState } from 'react';
import { useGetOrdersQuery } from '@/features/order-cashier/orderCashierApiSlice';
import { Order } from '@/features/order-cashier/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import OrderSearch from './OrderSearch';
import OrderTable from './OrderTable';

const OrderList = () => {
  const { data, isLoading, error } = useGetOrdersQuery();
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) return <div className="w-full p-6">Đang tải...</div>;
  if (error) return <div className="w-full p-6">Không thể tải danh sách đơn hàng</div>;

  const orders = data?.data || [];

  // Hàm xử lý tìm kiếm
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Lọc danh sách đơn hàng theo searchTerm
  const filteredOrders = orders.filter((order: Order) =>
    order.reservationId.toString().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Tiêu đề ngoài Card */}
      <h1 className="text-2xl font-bold">Quản Lý Thông Tin Đơn Hàng</h1>

      <Card className="w-full">
        {/* Card Header */}
        <CardHeader className="w-full">
          {/* Ô tìm kiếm */}
          <div className="flex items-center justify-between">
            <OrderSearch searchTerm={searchTerm} onSearchChange={handleSearchChange} />
          </div>
        </CardHeader>

        {/* Card Content - Bảng danh sách */}
        <CardContent className="w-full">
          <OrderTable orders={filteredOrders} />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderList;