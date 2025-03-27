import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { ReservationResponse } from "@/features/reservation/type";

interface ReservationListProps {
  reservations: ReservationResponse[];
}

export default function OrderPage({ reservations = [] }: ReservationListProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationResponse | null>(null);
  const router = useRouter();
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Đang chờ</Badge>;
      case "CONFIRMED":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Đã xác nhận</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return "N/A";
    return format(new Date(dateTimeStr), "HH:mm - dd/MM/yyyy", { locale: vi });
  };

  const getCardColor = (status: string) => {
    if (status === "PENDING" || status === "CANCELLED") {
      return "bg-red-100"; // Bàn chưa được đặt hoặc bị hủy, nền màu đỏ nhạt
    } else {
      return "bg-blue-100"; // Bàn đã được đặt, nền màu xanh dương nhạt
    }
  };

  // Xử lý việc tạo đơn hàng
  const handleCreateOrder = (reservation: ReservationResponse) => {
    toast.success(`Đơn hàng cho bàn ${reservation.id} đã được tạo.`);
    // router.push("order/menu-order");
    router.push(`order/menu-order/${reservation.id}`)
    
    
    // Logic xử lý tạo đơn hàng ở đây, ví dụ gửi API tạo đơn hoặc cập nhật trạng thái.
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-blue-600">Quản lý đặt bàn</h1>
        <Button variant="outline" size="icon" onClick={() => setIsViewOpen(true)}>
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>

      {/* Reservation Cards */}
      <div className="grid grid-cols-3 gap-4">
        {reservations.length === 0 ? (
          <p className="text-center col-span-3">Không có dữ liệu đặt bàn</p>
        ) : (
          reservations.map((reservation) => (
            <Card
              key={reservation.id}
              className={`${getCardColor(reservation.detail.status)} shadow-lg p-4`}
            >
              <CardHeader>
                <CardTitle>Bàn {reservation.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Tên khách hàng:</strong> {reservation.detail.customerName}</p>
                  <p><strong>Số điện thoại:</strong> {reservation.detail.customerPhone}</p>
                  <p><strong>Số người:</strong> {reservation.detail.numberOfPeople}</p>
                  <p><strong>Bàn:</strong> {reservation.detail.tableIds?.join(", ") || "N/A"}</p>
                  <p><strong>Thời gian vào:</strong> {formatDateTime(reservation.timeIn)}</p>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(reservation.detail.status)}
                  </div>
                </div>
                <div className="mt-2 flex justify-end space-x-2">
                  {/* Nút tạo đơn */}
                  <Button
                    variant="outline"
                    onClick={() => handleCreateOrder(reservation)}
                  >
                    Tạo đơn
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
