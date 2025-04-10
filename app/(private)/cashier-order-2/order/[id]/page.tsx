// pages/ReservationOrdersPage.tsx
'use client'
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useParams, useRouter } from "next/navigation"; // Added useRouter
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetOrdersByReservationIdQuery } from "@/features/order/orderApiSlice";
import { Order, OrderItem } from "@/features/order/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SplitOrderDialog } from "./split-order-dialog";
import { MergeOrdersDialog } from "./merge-orders-dialog";
import { ArrowLeft, X, AlertTriangle } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export default function ReservationOrdersPage() {
  const params = useParams(); // Get dynamic route params
  const router = useRouter(); // Added router for navigation
  const reservationId = Number(params.id); // Extract reservation ID from URL
  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // State cho modal cảnh báo
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

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
      case "Đã giao":
        return (
          <Badge className="bg-green-200 text-green-900 hover:bg-green-300">
            Đã giao
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

  const handleSplitOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsSplitDialogOpen(true);
  };

  const handleMergeOrders = () => {
    setIsMergeDialogOpen(true);
  };

  const handlePayment = (order: Order) => {
    // Kiểm tra xem tất cả các món ăn trong đơn hàng đã được giao hay chưa
    const allItemsDelivered = order.orderItems?.every(item => item.statusLabel === "Đã giao");
    
    if (!allItemsDelivered) {
      // Hiển thị modal cảnh báo thay vì alert
      setWarningMessage("Một số món ăn chưa được giao. Vui lòng đảm bảo tất cả món ăn đã được giao trước khi thanh toán.");
      setShowWarningModal(true);
      return;
    }
    
    // Nếu tất cả món đã giao, chuyển đến trang thanh toán
    router.push(`/payment/${order.id}`);
  };

  const handleBackToOrders = () => {
    router.push('/cashier-order-2/order');
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
      {/* Modal cảnh báo món ăn chưa giao */}
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Không thể thanh toán
            </DialogTitle>
            <DialogDescription className="text-gray-700">
              {warningMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button 
              variant="default" 
              onClick={() => setShowWarningModal(false)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        variant="outline"
        className="mb-4 flex items-center gap-1"
        onClick={handleBackToOrders}
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách đặt bàn
      </Button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Đơn hàng cho đặt bàn {reservationId}
        </h1>

        {orders.length > 1 && (
          <Button
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
            onClick={handleMergeOrders}
          >
            Gộp đơn hàng
          </Button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm">
          <p className="text-gray-600 text-lg font-medium">
            Chưa có đơn hàng nào cho đặt bàn này
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders.map((order: Order) => (
            <Card
              key={order.id}
              className={`${getCardColor(order.statusLabel)} shadow-md hover:shadow-lg transition-shadow duration-200 border rounded-lg`}
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

                <div className="flex flex-col gap-2 mt-4">
                  {order.orderItems.length > 0 && order.statusLabel === "Đang chờ" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100"
                      onClick={() => handleSplitOrder(order)}
                    >
                      Tách đơn hàng
                    </Button>
                  )}

                  <Button
                    variant="default"
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handlePayment(order)}
                  >
                    Thanh toán
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedOrder && (
        <SplitOrderDialog
          isOpen={isSplitDialogOpen}
          onClose={() => setIsSplitDialogOpen(false)}
          order={selectedOrder}
        />
      )}

      <MergeOrdersDialog
        isOpen={isMergeDialogOpen}
        onClose={() => setIsMergeDialogOpen(false)}
        reservationId={reservationId}
      />
    </div>
  );
}