'use client'
import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetOrdersByReservationIdQuery } from "@/features/order/orderApiSlice";
import { Order, OrderItem } from "@/features/order/types";
import { toast } from "sonner";
// Import icons from lucide-react
import { Plus, Clock, CheckCircle, AlertCircle, User, Package, Salad, Loader2, XCircle, Minus, Plus as PlusIcon } from "lucide-react";

export default function ReservationOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = Number(params.id);

  const { data: ordersResponse, isLoading, isError } = useGetOrdersByReservationIdQuery(reservationId);
  // const [updateOrderItem, { isLoading: isUpdating }] = useUpdateOrderItemMutation();

  // Sort orders by createdAt (earliest first)
  const orders = (ordersResponse?.data || []).slice().sort((a: Order, b: Order) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // State for editing quantity and status
  const [editStates, setEditStates] = useState<{
    [key: number]: { quantity: number; status: string };
  }>({});

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Đang chờ":
        return (
          <Badge className="bg-yellow-200 text-yellow-900 hover:bg-yellow-300 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Đang chờ
          </Badge>
        );
      case "Đã hoàn thành":
        return (
          <Badge className="bg-green-200 text-green-900 hover:bg-green-300 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Đã hoàn thành
          </Badge>
        );
      case "Đã hủy":
        return (
          <Badge className="bg-red-200 text-red-900 hover:bg-red-300 flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            Đã hủy
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

  const formatDateTime = (dateTimeStr: string) => {
    return format(new Date(dateTimeStr), "HH:mm - dd/MM/yyyy", { locale: vi });
  };

  const handleAddOrder = () => {
    router.push(`./menu-order/${reservationId}`);
  };

  const handleQuantityChange = (orderItemId: number, delta: number) => {
    setEditStates((prev) => {
      const current = prev[orderItemId] || { quantity: orders.flatMap((order: Order) => order.orderItems).find((item: OrderItem) => item.orderItemId === orderItemId)?.quantity || 1 };
      const newQuantity = Math.max(1, (current.quantity || 1) + delta);
      return {
        ...prev,
        [orderItemId]: {
          ...prev[orderItemId],
          quantity: newQuantity,
        },
      };
    });
  };

  const handleStatusChange = (orderItemId: number, status: string) => {
    setEditStates((prev) => ({
      ...prev,
      [orderItemId]: {
        ...prev[orderItemId],
        status,
      },
    }));
  };

  // const handleUpdate = async (orderItem: OrderItem) => {
  //   const editState = editStates[orderItem.orderItemId] || {};
  //   const updatedQuantity = editState.quantity ?? orderItem.quantity;
  //   const updatedStatus = editState.status ?? orderItem.statusLabel;

  //   try {
  //     await updateOrderItem({
  //       orderItemId: orderItem.orderItemId,
  //       quantity: updatedQuantity,
  //       status: updatedStatus,
  //     }).unwrap();
  //     toast.success(`Cập nhật món ${orderItem.dish.name} thành công!`, {
  //       position: "top-right",
  //     });
  //     // Clear edit state for this item
  //     setEditStates((prev) => {
  //       const newState = { ...prev };
  //       delete newState[orderItem.orderItemId];
  //       return newState;
  //     });
  //   } catch (error) {
  //     toast.error("Có lỗi xảy ra khi cập nhật món.", {
  //       position: "top-right",
  //     });
  //   }
  // };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          <p className="text-gray-600 text-lg font-medium">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <p className="text-red-600 text-lg font-medium">Có lỗi xảy ra khi tải đơn hàng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <Package className="w-8 h-8 text-indigo-600" />
          Đơn hàng cho đơn {reservationId}
        </h1>
        <Button
          variant="default"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
          onClick={handleAddOrder}
        >
          <Plus className="w-4 h-4" />
          Thêm đơn hàng
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-gray-600" />
            <p className="text-gray-600 text-lg font-medium">
              Chưa có đơn hàng nào cho đặt bàn này
            </p>
          </div>
        </div>
      ) : (
        <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {orders.map((order: Order, index: number) => (
            <Card
              key={order.id}
              className={`min-w-[350px] shadow-md hover:shadow-lg transition-shadow duration-200 border rounded-lg bg-gray-50 border-gray-300`}
            >
              <CardHeader className="pb-2 bg-opacity-50 bg-white">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-800" />
                  Đơn số {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="text-sm space-y-1">
                  <p className="text-gray-600 font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    Nhân viên: <span className="text-gray-800">ID {order.staffId}</span>
                  </p>
                  <p className="text-gray-600 font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    Thời gian tạo: <span className="text-gray-800">{formatDateTime(order.createdAt)}</span>
                  </p>
                  <p className="text-gray-600 font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    Cập nhật lúc: <span className="text-gray-800">{formatDateTime(order.updatedAt)}</span>
                  </p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Salad className="w-5 h-5 text-gray-800" />
                    Món ăn
                  </p>
                  <ul className="space-y-4">
                    {order.orderItems.map((item: OrderItem) => {
                      const isEditing = editStates[item.orderItemId] !== undefined;
                      const currentQuantity = isEditing ? editStates[item.orderItemId].quantity : item.quantity;
                      const currentStatus = isEditing ? editStates[item.orderItemId].status : item.statusLabel;

                      return (
                        <li key={item.orderItemId} className="flex flex-col gap-3 text-sm border-b pb-3 last:border-b-0">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-800 flex items-center gap-2">
                              <Salad className="w-4 h-4 text-gray-800" />
                              {item.dish.name}
                            </span>
                            {getStatusBadge(currentStatus)}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 font-medium">Số lượng:</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleQuantityChange(item.orderItemId, -1)}
                                disabled={currentQuantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="text-gray-800 font-medium w-8 text-center">{currentQuantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleQuantityChange(item.orderItemId, 1)}
                              >
                                <PlusIcon className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 font-medium">Trạng thái:</span>
                              <Button
                                variant={currentStatus === "Đã hủy" ? "destructive" : "outline"}
                                size="sm"
                                className="h-8 text-sm"
                                onClick={() => handleStatusChange(item.orderItemId, "CANCELLED")}
                                disabled={currentStatus === "Đã hủy"}
                              >
                                Hủy
                              </Button>
                              <Button
                                variant={currentStatus === "Đã hoàn thành" ? "default" : "outline"}
                                size="sm"
                                className={`h-8 text-sm ${currentStatus === "Đã hoàn thành" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                                onClick={() => handleStatusChange(item.orderItemId, "COMPLETED")}
                                disabled={currentStatus === "Đã hoàn thành"}
                              >
                                Hoàn thành
                              </Button>
                            </div>
                            <Button
                              variant="default"
                              size="sm"
                              className="h-8 text-sm bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
                              // onClick={() => handleUpdate(item)}
                              disabled={ !isEditing}
                            >
                              Cập nhật
                            </Button>
                          </div>
                        </li>
                      );
                    })}
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