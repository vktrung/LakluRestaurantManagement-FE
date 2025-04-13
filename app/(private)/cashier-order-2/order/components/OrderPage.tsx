// pages/OrderPage.tsx
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGetOrdersByReservationIdQuery } from "@/features/order/orderApiSlice";
import { ReservationResponse, TableInfo } from "@/features/reservation/type";

interface OrderPageProps {
  reservations: ReservationResponse[];
}

interface OrderQueryResult {
  data: any;
  isLoading: boolean;
  error: any;
  reservationId: number;
}

export default function OrderPage({ reservations }: OrderPageProps) {
  const router = useRouter();

  // Fetch all orders data at once for active reservations
  const activeReservations = useMemo(() => 
    reservations.filter(
      (reservation) => 
        reservation.detail.status !== "CANCELLED" && 
        reservation.detail.status !== "COMPLETED"
    ),
    [reservations]
  );

  // Create an array of reservation IDs
  const reservationIds = useMemo(() => 
    activeReservations.map(reservation => reservation.id),
    [activeReservations]
  );

  // Fetch orders for all active reservations
  const { data: ordersData, isLoading: isOrdersLoading } = useGetOrdersByReservationIdQuery(
    reservationIds[0] || 0, // Use the first reservation ID or 0 if none
    {
      skip: reservationIds.length === 0
    }
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-200 text-yellow-900 hover:bg-yellow-300">
            Đang chờ
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge className="bg-blue-200 text-blue-900 hover:bg-blue-300">
            Đã xác nhận
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-green-200 text-green-900 hover:bg-green-300">
            Hoàn thành
          </Badge>
        );
      default:
        return <Badge className="bg-gray-200 text-gray-900">{status}</Badge>;
    }
  };

  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return "N/A";
    return format(new Date(dateTimeStr), "HH:mm - dd/MM/yyyy", { locale: vi });
  };

  const getCardColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 border-yellow-300";
      case "CONFIRMED":
        return "bg-blue-50 border-blue-300";
      case "COMPLETED":
        return "bg-green-50 border-green-300";
      default:
        return "bg-gray-50 border-gray-300";
    }
  };

  const getTableBadgeStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-200 text-yellow-900 px-2 py-1 rounded-md text-sm font-medium";
      case "CONFIRMED":
        return "bg-blue-200 text-blue-900 px-2 py-1 rounded-md text-sm font-medium";
      case "COMPLETED":
        return "bg-green-200 text-green-900 px-2 py-1 rounded-md text-sm font-medium";
      default:
        return "bg-gray-200 text-gray-900 px-2 py-1 rounded-md text-sm font-medium";
    }
  };

  const getTableNumbers = (tables: TableInfo[] | undefined) => {
    if (!tables || tables.length === 0) return "N/A";
    return tables.map((table) => table.tableNumber).join(", ");
  };

  const handleCreateOrder = (reservation: ReservationResponse, hasOrders: boolean) => {
    if (hasOrders) {
      toast.success(`Đang xem đơn hàng cho đặt bàn ${reservation.id}.`, {
        position: "top-right",
      });
      router.push(`./order/${reservation.id}`); // Navigate to view orders
    } else {
      toast.success(`Đang tạo đơn hàng cho đặt bàn ${reservation.id}.`, {
        position: "top-right",
      });
      router.push(`./order/menu-order/${reservation.id}`); // Navigate to create order
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm">
        <p className="text-gray-600 text-lg font-medium">
          Không có dữ liệu đặt bàn hiện tại
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {activeReservations.map((reservation) => {
        const orders = ordersData?.data || [];
        const hasOrders = orders.length > 0;

        return (
          <Card
            key={reservation.id}
            className={`${getCardColor(
              reservation.detail.status
            )} shadow-md hover:shadow-lg transition-shadow duration-200 border rounded-lg`}
          >
            <CardHeader className="pb-2 bg-opacity-50 bg-white">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Bàn {getTableNumbers(reservation.detail.tables)}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(reservation.detail.status)}
                  {hasOrders ? (
                    <Badge className="bg-indigo-200 text-indigo-900">
                      Có {orders.length} đơn
                    </Badge>
                  ) : (
                    <Badge className="bg-red-200 text-red-900">Chưa có đơn</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Khách hàng</p>
                  <p className="text-gray-800">
                    {!reservation.detail.customerName || reservation.detail.customerName === "stringstri" 
                      ? "Chưa có tên" 
                      : reservation.detail.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Số điện thoại</p>
                  <p className="text-gray-800">
                    {!reservation.detail.customerPhone || reservation.detail.customerPhone === "stringstri" 
                      ? "Chưa có SĐT" 
                      : reservation.detail.customerPhone}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Số người</p>
                  <p className="text-gray-800">{reservation.detail.numberOfPeople}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Thời gian vào</p>
                <p className="text-gray-800">{formatDateTime(reservation.timeIn)}</p>
              </div>
              <Button
                variant="default"
                size="sm"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => handleCreateOrder(reservation, hasOrders)}
              >
                {hasOrders ? "Xem đơn" : "Tạo đơn hàng"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}