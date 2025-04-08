// pages/ReservationOrdersPage.tsx
'use client'
import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useParams, useRouter } from "next/navigation"; // Added useRouter for navigation
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetOrdersByReservationIdQuery } from "@/features/order/orderApiSlice";
import { Order, OrderItem } from "@/features/order/types";

export default function ReservationOrdersPage() {
  const params = useParams(); // Get dynamic route params
  const router = useRouter(); // Added for navigation
  const reservationId = Number(params.id); // Extract reservation ID from URL

  const { data: ordersResponse, isLoading, isError } = useGetOrdersByReservationIdQuery(reservationId);
  const orders = ordersResponse?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Đang chờ":
        return (
          <Badge className="bg-yellow-200 text-yellow-900 hover:bg-yellow-300">
            Đang chờ
          </Badge>
        );
      case "Đã hoàn thành":
        return (
          <Badge className="bg-green-200 text-green-900 hover:bg-green-300">
            Đã hoàn thành
          </Badge>
        );
      default:
        return <Badge className="bg-gray-200 text-gray-900">{status}</Badge>;
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    return format(new Date(dateTimeStr), "HH:mm - dd/MM/yyyy", { locale: vi });
  };

  const getCardColor = (status: string) => {
    switch (status) {
      case "Đang chờ":
        return "bg-yellow-50 border-yellow-300";
      case "Đã hoàn thành":
        return "bg-green-50 border-green-300";
      default:
        return "bg-gray-50 border-gray-300";
    }
  };

  // Handle adding a new order
  const handleAddOrder = () => {
    router.push(`./menu-order/${reservationId}`); // Navigate to create order page
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-600 text-lg font-medium">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-red-600 text-lg font-medium">Có lỗi xảy ra khi tải đơn hàng.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Đơn hàng cho đơn {reservationId}
        </h1>
        <Button
          variant="default"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={handleAddOrder}
        >
          Thêm đơn hàng
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm">
          <p className="text-gray-600 text-lg font-medium">
            Chưa có đơn hàng nào cho đặt bàn này
          </p>
        </div>
      ) : (
        <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {orders.map((order: Order) => (
            <Card
              key={order.id}
              className={`${getCardColor(order.statusLabel)} min-w-[350px] shadow-md hover:shadow-lg transition-shadow duration-200 border rounded-lg`}
            >
              <CardHeader className="pb-2 bg-opacity-50 bg-white">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    Đơn hàng #{order.id}
                  </CardTitle>
                  {getStatusBadge(order.statusLabel)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="text-sm">
                  <p className="text-gray-600 font-medium">Nhân viên: <span className="text-gray-800">ID {order.staffId}</span></p>
                  <p className="text-gray-600 font-medium">Thời gian tạo: <span className="text-gray-800">{formatDateTime(order.createdAt)}</span></p>
                  <p className="text-gray-600 font-medium">Cập nhật lúc: <span className="text-gray-800">{formatDateTime(order.updatedAt)}</span></p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Món ăn:</p>
                  <ul className="space-y-2">
                    {order.orderItems.map((item: OrderItem) => (
                      <li key={item.orderItemId} className="flex justify-between items-center text-sm">
                        <span className="text-gray-800">
                          {item.dish.name} (x{item.quantity})
                        </span>
                        {getStatusBadge(item.statusLabel)}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}