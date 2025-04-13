'use client'
import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGetReservationsQuery } from "@/features/reservation/reservationApiSlice";
import { useGetOrdersByReservationIdQuery } from "@/features/order/orderApiSlice";
import { ReservationResponse, TableInfo } from "@/features/reservation/type";
// Import icons from lucide-react
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
} from "lucide-react";

// Tách thành component con để xử lý việc lấy đơn hàng theo ID đặt bàn
type ReservationCardProps = {
  reservation: ReservationResponse;
  getStatusBadge: (status: string) => JSX.Element;
  getCardColor: (status: string) => string;
  getTableBadgeStyle: (status: string) => string;
  getTableNumbers: (tables: TableInfo[] | undefined) => string;
  formatDateTime: (dateTimeStr: string | null) => string;
  handleCreateOrder: (reservation: ReservationResponse) => void;
};

function ReservationCard({
  reservation,
  getStatusBadge,
  getCardColor,
  getTableBadgeStyle,
  getTableNumbers,
  formatDateTime,
  handleCreateOrder,
}: ReservationCardProps) {
  const { data: ordersResponse, isFetching: ordersFetching } = useGetOrdersByReservationIdQuery(reservation.id);
  const orders = ordersResponse?.data || [];
  const hasOrders = orders.length > 0;

  return (
    <Card
      className={`${getCardColor(
        reservation.detail.status
      )} min-w-[300px] shadow-md hover:shadow-lg transition-shadow duration-200 border rounded-lg`}
    >
      <CardHeader className="pb-2 bg-opacity-50 bg-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Table2 className="w-5 h-5 text-gray-800" />
            Bàn {reservation.id}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getStatusBadge(reservation.detail.status)}
            {ordersFetching ? (
              <Badge className="bg-gray-200 text-gray-900 flex items-center gap-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang kiểm tra...
              </Badge>
            ) : hasOrders ? (
              <Badge className="bg-indigo-200 text-indigo-900 flex items-center gap-1">
                <ShoppingCart className="w-4 h-4" />
                Có {orders.length} đơn
              </Badge>
            ) : (
              <Badge className="bg-red-200 text-red-900 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                Chưa có đơn
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-600 font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-gray-600" />
              Khách hàng
            </p>
            <p className="text-gray-800">{reservation.detail.customerName}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-600" />
              Số điện thoại
            </p>
            <p className="text-gray-800">{reservation.detail.customerPhone}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-600" />
              Số người
            </p>
            <p className="text-gray-800">{reservation.detail.numberOfPeople}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium flex items-center gap-2">
              <Table2 className="w-4 h-4 text-gray-600" />
              Bàn
            </p>
            <span className={getTableBadgeStyle(reservation.detail.status)}>
              {getTableNumbers(reservation.detail.tables)}
            </span>
          </div>
        </div>
        <div>
          <p className="text-gray-600 font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            Thời gian vào
          </p>
          <p className="text-gray-800">{formatDateTime(reservation.timeIn)}</p>
        </div>
        <Button
          variant="default"
          size="sm"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2 flex items-center gap-2"
          onClick={() => handleCreateOrder(reservation)}
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
  const [isViewOpen] = useState(false);
  const router = useRouter();

  const { data: reservationsResponse, isLoading, isError } = useGetReservationsQuery({ page: 0, size: 100 });
  const reservations = reservationsResponse?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-200 text-yellow-900 hover:bg-yellow-300 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Đang chờ
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge className="bg-blue-200 text-blue-900 hover:bg-blue-300 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Đã xác nhận
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-green-200 text-green-900 hover:bg-green-300 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Hoàn thành
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-200 text-gray-900 flex items-center gap-1">
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

  const handleCreateOrder = (reservation: ReservationResponse) => {
    toast.success(`Đang mở đơn hàng cho đặt bàn ${reservation.id}.`, {
      position: "top-right",
    });
    router.push(`/order/${reservation.id}`);
  };

  const activeReservations = reservations.filter(
    (reservation) => reservation.detail.status !== "CANCELLED"
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          <p className="text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <p className="text-red-600 text-lg font-medium">Có lỗi xảy ra khi tải dữ liệu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight flex items-center gap-2">
        <Table2 className="w-8 h-8 text-indigo-600" />
        Quản lý đặt bàn
      </h1>

      {activeReservations.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-gray-600" />
            <p className="text-gray-600 text-lg font-medium">
              Không có dữ liệu đặt bàn hiện tại
            </p>
          </div>
        </div>
      ) : (
        <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {activeReservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              getStatusBadge={getStatusBadge}
              getCardColor={getCardColor}
              getTableBadgeStyle={getTableBadgeStyle}
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