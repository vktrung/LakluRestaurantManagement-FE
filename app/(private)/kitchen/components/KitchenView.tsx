'use client';

import { useEffect, useState } from 'react';
import { useGetOrdersQuery } from '@/features/order-cashier/orderCashierApiSlice';
import { useGetUserMeQuery } from '@/features/auth/authApiSlice';
import OrderList from './OrderList';
import { Loader2, ChefHat, RefreshCw } from 'lucide-react';
import { Order } from '@/features/order-cashier/types';
import { Button } from '@/components/ui/button';

export default function KitchenView() {
  // Lấy dữ liệu order từ API
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
    error: ordersError,
    isError: isOrdersError,
  } = useGetOrdersQuery(undefined, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 15000, // Poll every 15 seconds
  });

  // Lấy thông tin người dùng hiện tại
  const { data: userData, isLoading: isLoadingUser } = useGetUserMeQuery();

  // State để theo dõi các orders cần hiển thị
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Xử lý dữ liệu khi orders thay đổi
  useEffect(() => {
    if (ordersData?.data) {
      // Lọc orders chưa hoàn thành và sắp xếp theo ID giảm dần
      const filteredOrders = ordersData.data
        .filter(order => {
          // Chỉ giữ lại đơn hàng có ít nhất một món chưa hoàn thành và chưa bị hủy
          return order.orderItems.some(
            item =>
              item.statusLabel !== 'Đã hoàn thành' &&
              item.statusLabel !== 'Đã hủy',
          );
        })
        .sort((a, b) => b.id - a.id);

      setActiveOrders(filteredOrders);
    }
  }, [ordersData]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (isLoadingOrders || isLoadingUser) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500 mb-4" />
        <span className="text-xl font-medium text-zinc-700">
          Đang tải dữ liệu...
        </span>
      </div>
    );
  }

  // Handle error state
  if (isOrdersError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-800 mb-2">
            Không thể tải dữ liệu
          </h2>
          <p className="text-zinc-600 mb-4">
            Có lỗi xảy ra khi tải dữ liệu đơn hàng.
          </p>
          <Button
            onClick={handleRefresh}
            variant="default"
            className="bg-amber-500 hover:bg-amber-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pl-0 mr-0 w-full">
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div className="flex items-center">
          <ChefHat className="h-8 w-8 text-amber-600 mr-3" />
          <h1 className="text-2xl font-bold text-zinc-800">Màn hình bếp</h1>
        </div>
        <div className="text-right">
          <p className="text-zinc-700 font-medium text-xl">
            {currentTime.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })}
          </p>
          <p className="text-zinc-600">
            {currentTime.toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between border-b pb-3">
        <h2 className="text-lg font-semibold text-zinc-800 flex items-center">
          <span className="inline-block w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
          Đơn cần xử lý ({activeOrders.length})
        </h2>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="text-zinc-700 hover:text-zinc-900 border-zinc-300 hover:bg-amber-50"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Làm mới
        </Button>
      </div>

      <div className="mt-0">
        {activeOrders.length > 0 ? (
          <OrderList
            orders={activeOrders}
            allOrders={ordersData?.data || []}
            status="pending"
            refetchOrders={refetchOrders}
          />
        ) : (
          <div className="text-left border rounded-lg border-zinc-200 p-6">
            <ChefHat className="h-16 w-16 mx-auto my-6 text-zinc-300" />
            <p className="text-xl font-medium mb-2 text-zinc-700">
              Không có đơn hàng nào cần xử lý
            </p>
            <p className="text-zinc-500 pb-6">
              Đơn hàng mới sẽ xuất hiện ở đây
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
