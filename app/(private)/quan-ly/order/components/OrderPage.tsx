'use client';

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGetReservationsByTimeRangeQuery } from "@/features/reservation/reservationApiSlice";
import { useGetOrdersByReservationIdQuery } from "@/features/order/orderApiSlice";
import { ReservationResponse, TableInfo, TimeRangeType } from "@/features/reservation/type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Users,
  Table2,
  Loader2,
  Package,
  ShoppingCart,
  XCircle,
  Calendar,
} from "lucide-react";

type ReservationCardProps = {
  reservation: ReservationResponse;
  getStatusBadge: (status: string) => JSX.Element;
  getCardColor: (status: string) => string;
  getTableNumber: (tables: TableInfo[] | undefined) => string;
  formatDateTime: (dateTimeStr: string | null) => string;
  handleCreateOrder: (reservation: ReservationResponse, hasOrders: boolean) => void;
};

function ReservationCard({
  reservation,
  getStatusBadge,
  getCardColor,
  getTableNumber,
  formatDateTime,
  handleCreateOrder,
}: ReservationCardProps) {
  const { data: ordersResponse, isFetching: ordersFetching } = useGetOrdersByReservationIdQuery(
    reservation.id
  );
  const orders = ordersResponse?.data || [];
  const hasOrders = orders.length > 0;

  return (
    <Card
      className={`${getCardColor(
        reservation.detail.status
      )} shadow-md hover:shadow-lg transition-all duration-300 border rounded-lg overflow-hidden max-w-full sm:max-w-[300px] mx-auto`}
    >
      <CardHeader className="pb-2 bg-opacity-70 bg-white border-b">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-1.5 overflow-hidden text-ellipsis">
            <Table2 className="w-4 h-4 text-gray-800 shrink-0" />
            Bàn {getTableNumber(reservation.detail.tables)}
          </CardTitle>
          <div className="flex items-center gap-1 flex-wrap">
            {getStatusBadge(reservation.detail.status)}
            {ordersFetching ? (
              <Badge className="bg-gray-200 text-gray-900 flex items-center gap-0.5 text-xs py-0.5 px-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Đang kiểm tra
              </Badge>
            ) : hasOrders ? (
              <Badge className="bg-indigo-200 text-indigo-900 flex items-center gap-0.5 text-xs py-0.5 px-1">
                <ShoppingCart className="w-3 h-3" />
                Có {orders.length} đơn
              </Badge>
            ) : (
              <Badge className="bg-red-200 text-red-900 flex items-center gap-0.5 text-xs py-0.5 px-1">
                <XCircle className="w-3 h-3" />
                Chưa có đơn
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-3">
        <div className="space-y-2 text-xs">
          <div className="flex items-center">
            <p className="w-28 text-gray-600 font-medium flex items-center gap-1.5 shrink-0">
              <User className="w-3.5 h-3.5 text-gray-600" />
              Khách hàng
            </p>
            <p className="text-gray-800 font-semibold truncate">{reservation.detail.customerName}</p>
          </div>
          <div className="flex items-center">
            <p className="w-28 text-gray-600 font-medium flex items-center gap-1.5 shrink-0">
              <Phone className="w-3.5 h-3.5 text-gray-600" />
              Số điện thoại
            </p>
            <p className="text-gray-800 font-semibold truncate">{reservation.detail.customerPhone}</p>
          </div>
          <div className="flex items-center">
            <p className="w-28 text-gray-600 font-medium flex items-center gap-1.5 shrink-0">
              <Users className="w-3.5 h-3.5 text-gray-600" />
              Số người
            </p>
            <p className="text-gray-800 font-semibold">{reservation.detail.numberOfPeople}</p>
          </div>
          <div className="flex items-center">
            <p className="w-28 text-gray-600 font-medium flex items-center gap-1.5 shrink-0">
              <Table2 className="w-3.5 h-3.5 text-gray-600" />
              ID đặt bàn
            </p>
            <p className="text-gray-800 font-semibold">#{reservation.id}</p>
          </div>
          <div className="flex items-center">
            <p className="w-28 text-gray-600 font-medium flex items-center gap-1.5 shrink-0">
              <Clock className="w-3.5 h-3.5 text-gray-600" />
              Thời gian vào
            </p>
            <p className="text-gray-800 font-semibold truncate">{formatDateTime(reservation.timeIn)}</p>
          </div>
        </div>
        <Button
          variant="default"
          size="sm"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-3 flex items-center gap-1.5 text-xs h-8"
          onClick={() => handleCreateOrder(reservation, hasOrders)}
        >
          {hasOrders && !ordersFetching ? (
            <>
              <Package className="w-3.5 h-3.5" />
              Xem đơn
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Tạo đơn hàng
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function OrderPage() {
  const [timeRange, setTimeRange] = useState<TimeRangeType>("today");
  const router = useRouter();

  const {
    data: reservationsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetReservationsByTimeRangeQuery({
    timeRange: timeRange,
    page: 0,
    size: 10,
  });

  const reservations = reservationsResponse?.data?.content || [];

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
          <Badge className="bg-yellow-200 text-yellow-900 hover:bg-yellow-300 flex items-center gap-0.5 text-xs py-0.5 px-1">
            <Clock className="w-3 h-3" />
            Đang chờ
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge className="bg-blue-200 text-blue-900 hover:bg-blue-300 flex items-center gap-0.5 text-xs py-0.5 px-1">
            <CheckCircle className="w-3 h-3" />
            Đã xác nhận
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-green-200 text-green-900 hover:bg-green-300 flex items-center gap-0.5 text-xs py-0.5 px-1">
            <CheckCircle className="w-3 h-3" />
            Hoàn thành
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-red-200 text-red-900 hover:bg-red-300 flex items-center gap-0.5 text-xs py-0.5 px-1">
            <XCircle className="w-3 h-3" />
            Đã hủy
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-200 text-gray-900 flex items-center gap-0.5 text-xs py-0.5 px-1">
            <AlertCircle className="w-3 h-3" />
            {status}
          </Badge>
        );
    }
  };

  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return "N/A";
    return format(new Date(dateTimeStr), "HH:mm - dd/MM/yyyy", { locale: vi });
  };

  const getCardColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 border-yellow-200";
      case "CONFIRMED":
        return "bg-blue-50 border-blue-200";
      case "COMPLETED":
        return "bg-green-50 border-green-200";
      case "CANCELLED":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getTableNumber = (tables: TableInfo[] | undefined) => {
    if (!tables || tables.length === 0) return "N/A";
    return tables[0].tableNumber;
  };

  const handleCreateOrder = (reservation: ReservationResponse, hasOrders: boolean) => {
    if (hasOrders) {
      toast.success(`Đang xem đơn hàng cho đặt bàn ${reservation.id}.`, {
        position: "top-right",
      });
      router.push(`./order/${reservation.id}`);
    } else {
      toast.success(`Đang tạo đơn hàng cho đặt bàn ${reservation.id}.`, {
        position: "top-right",
      });
      router.push(`./order/menu-order/${reservation.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <p className="text-gray-700 text-base font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <p className="text-red-600 text-base font-medium">Có lỗi xảy ra khi tải dữ liệu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Table2 className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
          Gọi món
        </h1>
        <div className="w-full sm:w-48">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="bg-white border border-gray-200 focus:border-indigo-300 transition-colors rounded-md shadow-sm h-9">
              <Calendar className="w-4 h-4 text-indigo-600 mr-1.5" />
              <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-md rounded-md">
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100vh-10rem)] bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-gray-400" />
            <p className="text-gray-600 text-base sm:text-lg font-medium text-center">
              Không có dữ liệu đặt bàn trong khoảng thời gian đã chọn
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pb-4">
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              getStatusBadge={getStatusBadge}
              getCardColor={getCardColor}
              getTableNumber={getTableNumber}
              formatDateTime={formatDateTime}
              handleCreateOrder={handleCreateOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}