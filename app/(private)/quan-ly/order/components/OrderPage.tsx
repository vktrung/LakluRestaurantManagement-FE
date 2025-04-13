'use client'
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
  getTableNumbers: (tables: TableInfo[] | undefined) => string;
  formatDateTime: (dateTimeStr: string | null) => string;
  handleCreateOrder: (reservation: ReservationResponse, hasOrders: boolean) => void;
};

function ReservationCard({
  reservation,
  getStatusBadge,
  getCardColor,
  getTableNumbers,
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
      )} shadow-lg hover:shadow-xl transition-all duration-300 border-2 rounded-xl overflow-hidden transform hover:-translate-y-1 max-w-[350px] mx-auto`}
    >
      <CardHeader className="pb-3 bg-opacity-70 bg-white border-b">
        <div className="space-y-2">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2 overflow-hidden text-ellipsis">
            <Table2 className="w-5 h-5 text-gray-800 shrink-0" />
            Bàn {getTableNumbers(reservation.detail.tables)}
          </CardTitle>
          <div className="flex items-center gap-1">
            {getStatusBadge(reservation.detail.status)}
            {ordersFetching ? (
              <Badge className="bg-gray-200 text-gray-900 flex items-center gap-1 text-sm py-0.5 px-1 whitespace-nowrap">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang kiểm tra
              </Badge>
            ) : hasOrders ? (
              <Badge className="bg-indigo-200 text-indigo-900 flex items-center gap-1 text-sm py-0.5 px-1 whitespace-nowrap">
                <ShoppingCart className="w-4 h-4" />
                Có {orders.length} đơn
              </Badge>
            ) : (
              <Badge className="bg-red-200 text-red-900 flex items-center gap-1 text-sm py-0.5 px-1 whitespace-nowrap">
                <XCircle className="w-4 h-4" />
                Chưa có đơn
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center">
            <p className="w-32 text-gray-600 font-medium flex items-center gap-2 shrink-0">
              <User className="w-4 h-4 text-gray-600" />
              Khách hàng
            </p>
            <p className="text-gray-800 font-semibold truncate">{reservation.detail.customerName}</p>
          </div>
          <div className="flex items-center">
            <p className="w-32 text-gray-600 font-medium flex items-center gap-2 shrink-0">
              <Phone className="w-4 h-4 text-gray-600" />
              Số điện thoại
            </p>
            <p className="text-gray-800 font-semibold truncate">{reservation.detail.customerPhone}</p>
          </div>
          <div className="flex items-center">
            <p className="w-32 text-gray-600 font-medium flex items-center gap-2 shrink-0">
              <Users className="w-4 h-4 text-gray-600" />
              Số người
            </p>
            <p className="text-gray-800 font-semibold">{reservation.detail.numberOfPeople}</p>
          </div>
          <div className="flex items-center">
            <p className="w-32 text-gray-600 font-medium flex items-center gap-2 shrink-0">
              <Table2 className="w-4 h-4 text-gray-600" />
              ID đặt bàn
            </p>
            <p className="text-gray-800 font-semibold">#{reservation.id}</p>
          </div>
          <div className="flex items-center">
            <p className="w-32 text-gray-600 font-medium flex items-center gap-2 shrink-0">
              <Clock className="w-4 h-4 text-gray-600" />
              Thời gian vào
            </p>
            <p className="text-gray-800 font-semibold truncate">{formatDateTime(reservation.timeIn)}</p>
          </div>
        </div>
        <Button
          variant="default"
          size="sm"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4 flex items-center gap-2 transition-colors duration-200"
          onClick={() => handleCreateOrder(reservation, hasOrders)}
        >
          {hasOrders && !ordersFetching ? (
            <>
              <Package className="w-4 h-4" />
              Xem đơn
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
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
          <Badge className="bg-yellow-200 text-yellow-900 hover:bg-yellow-300 flex items-center gap-1 text-sm py-0.5 px-1 whitespace-nowrap">
            <Clock className="w-4 h-4" />
            Đang chờ
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge className="bg-blue-200 text-blue-900 hover:bg-blue-300 flex items-center gap-1 text-sm py-0.5 px-1 whitespace-nowrap">
            <CheckCircle className="w-4 h-4" />
            Đã xác nhận
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-green-200 text-green-900 hover:bg-green-300 flex items-center gap-1 text-sm py-0.5 px-1 whitespace-nowrap">
            <CheckCircle className="w-4 h-4" />
            Hoàn thành
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-red-200 text-red-900 hover:bg-red-300 flex items-center gap-1 text-sm py-0.5 px-1 whitespace-nowrap">
            <XCircle className="w-4 h-4" />
            Đã hủy
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-200 text-gray-900 flex items-center gap-1 text-sm py-0.5 px-1 whitespace-nowrap">
            <AlertCircle className="w-4 h-4" />
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
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-gray-700 text-xl font-semibold">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <p className="text-red-600 text-xl font-semibold">Có lỗi xảy ra khi tải dữ liệu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Table2 className="w-9 h-9 text-indigo-600" />
          Quản lý đặt bàn
        </h1>
        <div className="w-full sm:w-64">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="bg-white border-2 border-indigo-200 focus:border-indigo-400 transition-colors rounded-lg shadow-sm">
              <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
              <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg rounded-lg">
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)] bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-gray-400" />
            <p className="text-gray-600 text-xl font-semibold">
              Không có dữ liệu đặt bàn trong khoảng thời gian đã chọn
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-6">
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              getStatusBadge={getStatusBadge}
              getCardColor={getCardColor}
              getTableNumbers={getTableNumbers}
              formatDateTime={formatDateTime}
              handleCreateOrder={handleCreateOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}