'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useGetOrdersByReservationIdQuery,
  useUpdateOrderItemQuantityMutation,
  useUpdateOrderItemStatusBatchMutation,
} from '@/features/order/orderApiSlice';
import { Order, OrderItem } from '@/features/order/types';
import { toast } from 'sonner';
import {
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Package,
  Salad,
  Loader2,
  XCircle,
  Minus,
  Plus as PlusIcon,
  Truck,
} from 'lucide-react';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
// import ConfirmationModal from '@/components/ConfirmationModal'; // Import the modal

export default function ReservationOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = Number(params.id);

  const { data: ordersResponse, isLoading, isError } = useGetOrdersByReservationIdQuery(reservationId);
  const [updateOrderItemQuantity, { isLoading: isUpdatingQuantity }] = useUpdateOrderItemQuantityMutation();
  const [updateOrderItemStatusBatch, { isLoading: isUpdatingStatus }] = useUpdateOrderItemStatusBatchMutation();

  const orders = (ordersResponse?.data || []).slice().sort((a: Order, b: Order) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const [editStates, setEditStates] = useState<{
    [key: number]: { quantity: number };
  }>({});

  // State for managing the confirmation modal
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const openModal = (title: string, description: string, onConfirm: () => void) => {
    setModalState({
      isOpen: true,
      title,
      description,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Đang chờ':
        return (
          <Badge className="bg-yellow-200 text-yellow-900 hover:bg-yellow-300 flex items-center gap-0.5 text-xs py-0.5 px-1">
            <Clock className="w-3 h-3" />
            Đang chờ
          </Badge>
        );
      case 'Đã hoàn thành':
        return (
          <Badge className="bg-green-200 text-green-900 hover:bg-green-300 flex items-center gap-0.5 text-xs py-0.5 px-1">
            <CheckCircle className="w-3 h-3" />
            Đã hoàn thành
          </Badge>
        );
      case 'Đã hủy':
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

  const formatDateTime = (dateTimeStr: string) => {
    return format(new Date(dateTimeStr), 'HH:mm - dd/MM/yyyy', { locale: vi });
  };

  const handleAddOrder = () => {
    router.push(`./menu-order/${reservationId}`);
  };

  const handleQuantityChange = (orderItemId: number, delta: number) => {
    setEditStates((prev) => {
      const current = prev[orderItemId] || {
        quantity: orders
          .flatMap((order: Order) => order.orderItems)
          .find((item: OrderItem) => item.orderItemId === orderItemId)?.quantity || 1,
      };
      const newQuantity = Math.max(1, (current.quantity || 1) + delta);
      return {
        ...prev,
        [orderItemId]: {
          quantity: newQuantity,
        },
      };
    });
  };

  const handleUpdateQuantity = async (orderItem: OrderItem) => {
    const editState = editStates[orderItem.orderItemId] || {};
    const updatedQuantity = editState.quantity ?? orderItem.quantity;

    try {
      await updateOrderItemQuantity({
        orderItemId: orderItem.orderItemId,
        quantity: updatedQuantity,
      }).unwrap();
      toast.success(`Cập nhật số lượng món ${orderItem.dish.name} thành công!`, {
        position: 'top-right',
      });
      setEditStates((prev) => {
        const newState = { ...prev };
        delete newState[orderItem.orderItemId];
        return newState;
      });
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi cập nhật số lượng món.';
      toast.error(errorMessage, {
        position: 'top-right',
      });
      console.error('Update quantity error:', error);
    }
  };

  const handleDeliverItem = async (orderItem: OrderItem) => {
    openModal(
      'Xác nhận giao món',
      `Bạn có chắc muốn đánh dấu món ${orderItem.dish.name} là đã giao?`,
      async () => {
        try {
          await updateOrderItemStatusBatch({
            status: 'DELIVERED',
            orderItemIds: [orderItem.orderItemId],
          }).unwrap();
          toast.success(`Món ${orderItem.dish.name} đã được đánh dấu là đã giao!`, {
            position: 'top-right',
          });
        } catch (error: any) {
          const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái món.';
          toast.error(errorMessage, {
            position: 'top-right',
          });
          console.error('Deliver item error:', error);
        }
        closeModal();
      }
    );
  };

  const handleCancelItem = async (orderItem: OrderItem) => {
    openModal(
      'Xác nhận hủy món',
      `Bạn có chắc muốn hủy món ${orderItem.dish.name}?`,
      async () => {
        try {
          await updateOrderItemStatusBatch({
            status: 'CANCELLED',
            orderItemIds: [orderItem.orderItemId],
          }).unwrap();
          toast.success(`Món ${orderItem.dish.name} đã được hủy thành công!`, {
            position: 'top-right',
          });
        } catch (error: any) {
          const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi hủy món.';
          toast.error(errorMessage, {
            position: 'top-right',
          });
          console.error('Cancel item error:', error);
        }
        closeModal();
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          <p className="text-gray-600 text-base font-medium">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-600 text-base font-medium">Có lỗi xảy ra khi tải đơn hàng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
          Đơn hàng
        </h1>
        <Button
          variant="default"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 h-8 w-full sm:w-auto"
          onClick={handleAddOrder}
        >
          <Plus className="w-4 h-4" />
          Thêm đơn
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100vh-10rem)] bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-gray-400" />
            <p className="text-gray-600 text-base sm:text-lg font-medium text-center">
              Chưa có đơn hàng nào cho đặt bàn này
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-4 pb-4">
          {orders.map((order: Order, index: number) => (
            <Card
              key={order.id}
              className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] max-w-full shadow-md hover:shadow-lg transition-shadow duration-200 border rounded-lg bg-gray-50 border-gray-200 mb-4 sm:mb-0"
            >
              <CardHeader className="pb-2 bg-opacity-50 bg-white">
                <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-gray-800" />
                  Đơn số {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="text-xs space-y-1.5">
                  <p className="text-gray-600 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-600" />
                    Nhân viên: <span className="text-gray-800">ID {order.staffId}</span>
                  </p>
                  <p className="text-gray-600 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-600" />
                    Tạo: <span className="text-gray-800">{formatDateTime(order.createdAt)}</span>
                  </p>
                  <p className="text-gray-600 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-600" />
                    Cập nhật: <span className="text-gray-800">{formatDateTime(order.updatedAt)}</span>
                  </p>
                </div>
                <div className="border-t pt-2">
                  <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                    <Salad className="w-4 h-4 text-gray-800" />
                    Món ăn
                  </p>
                  <ul className="space-y-3">
                    {order.orderItems.map((item: OrderItem) => {
                      const isEditing = editStates[item.orderItemId] !== undefined;
                      const currentQuantity = isEditing ? editStates[item.orderItemId].quantity : item.quantity;
                      const isPending = item.statusLabel === 'Đang chờ';

                      return (
                        <li key={item.orderItemId} className="flex flex-col gap-2 text-xs border-b pb-2 last:border-b-0">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-800 flex items-center gap-1.5">
                              <Salad className="w-3.5 h-3.5 text-gray-800" />
                              {item.dish.name} - {item.dish.price.toLocaleString('vi-VN')} VNĐ
                            </span>
                            {getStatusBadge(item.statusLabel)}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 font-medium">Số lượng:</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => handleQuantityChange(item.orderItemId, -1)}
                                disabled={currentQuantity <= 1 || !isPending}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </Button>
                              <span className="text-gray-800 font-medium w-6 text-center">{currentQuantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => handleQuantityChange(item.orderItemId, 1)}
                                disabled={!isPending}
                              >
                                <PlusIcon className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                variant="default"
                                size="sm"
                                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                onClick={() => handleUpdateQuantity(item)}
                                disabled={isUpdatingQuantity || !isEditing || !isPending}
                              >
                                Cập nhật
                              </Button>
                              {isPending && !item.dish.requiresPreparation && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs border-green-600 text-green-600 hover:bg-green-50"
                                  onClick={() => handleDeliverItem(item)}
                                  disabled={isUpdatingStatus}
                                >
                                  <Truck className="w-3.5 h-3.5 mr-1" />
                                  Đã giao
                                </Button>
                              )}
                              {isPending && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs border-red-600 text-red-600 hover:bg-red-50"
                                  onClick={() => handleCancelItem(item)}
                                  disabled={isUpdatingStatus}
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" />
                                  Hủy
                                </Button>
                              )}
                            </div>
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

      {/* Render the ConfirmationModal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        description={modalState.description}
        confirmText="Xác nhận"
        cancelText="Hủy"
      />
    </div>
  );
}