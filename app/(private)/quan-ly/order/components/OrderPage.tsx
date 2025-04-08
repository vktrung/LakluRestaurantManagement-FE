// pages/OrderPage.tsx
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  useGetReservationsByTimeRangeQuery
} from "@/features/reservation/reservationApiSlice";
import { useGetOrdersByReservationIdQuery } from "@/features/order/orderApiSlice";
import { ReservationResponse, TableInfo, TimeRangeType } from "@/features/reservation/type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OrderPage() {
  const [timeRange, setTimeRange] = useState<TimeRangeType>("today");
  const router = useRouter();

  // Use the time range query instead of the general getReservations
  const { 
    data: reservationsResponse, 
    isLoading, 
    isError,
    refetch
  } = useGetReservationsByTimeRangeQuery({
    timeRange: timeRange,
    page: 0,
    size: 10
  });

  // Extract reservations from the paged response - access the content array
  const reservations = reservationsResponse?.data?.content || [];

  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRangeType);
  };

  useEffect(() => {
    refetch();
  }, [timeRange, refetch]);

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
      case "CANCELLED":
        return (
          <Badge className="bg-red-200 text-red-900 hover:bg-red-300">
            Đã hủy
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
      case "CANCELLED":
        return "bg-red-50 border-red-300";
      default:
        return "bg-gray-50 border-gray-300";
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-red-600 text-lg font-medium">Có lỗi xảy ra khi tải dữ liệu.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight mb-4 sm:mb-0">
          Quản lý đặt bàn
        </h1>
        
        <div className="w-full sm:w-64">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="yesterday">Hôm qua</SelectItem>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm">
          <p className="text-gray-600 text-lg font-medium">
            Không có dữ liệu đặt bàn trong khoảng thời gian đã chọn
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
          {reservations.map((reservation) => {
            // Fetch orders for each reservation
            const { data: ordersResponse, isFetching: ordersFetching } = useGetOrdersByReservationIdQuery(reservation.id);
            const orders = ordersResponse?.data || [];
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
                      {ordersFetching ? (
                        <Badge className="bg-gray-200 text-gray-900">Đang kiểm tra...</Badge>
                      ) : hasOrders ? (
                        <Badge className="bg-indigo-200 text-indigo-900">
                          Có {orders.length} đơn
                        </Badge>
                      ) : (
                        <Badge className="bg-red-200 text-red-900">Chưa có đơn</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Khách hàng</p>
                      <p className="text-gray-800">{reservation.detail.customerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Số điện thoại</p>
                      <p className="text-gray-800">{reservation.detail.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Số người</p>
                      <p className="text-gray-800">{reservation.detail.numberOfPeople}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">ID đặt bàn</p>
                      <p className="text-gray-800">#{reservation.id}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Thời gian vào</p>
                    <p className="text-gray-800">{formatDateTime(reservation.timeIn)}</p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
                    onClick={() => handleCreateOrder(reservation, hasOrders)}
                  >
                    {hasOrders && !ordersFetching ? "Xem đơn" : "Tạo đơn hàng"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}