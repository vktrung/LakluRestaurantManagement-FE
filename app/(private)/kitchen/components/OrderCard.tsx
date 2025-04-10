'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  ChefHat,
  Ban,
} from 'lucide-react';
import {
  Order,
  OrderItem,
  OrderItemStatus,
} from '@/features/order-cashier/types';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Toggle } from '@/components/ui/toggle';
import {
  useUpdateOrderItemStatusMutation,
  useGetOrderItemByIdQuery,
} from '@/features/order-cashier/orderCashierApiSlice';
import { useGetStaffByIdQuery } from '@/features/staff/staffApiSlice';

interface OrderCardProps {
  order: Order;
  refetchOrders: () => void;
  orderNumber: number;
}

const isValidStatusTransition = (
  currentStatus: string,
  newStatus: OrderItemStatus,
): boolean => {
  switch (currentStatus) {
    case 'Đang chờ':
      return newStatus === 'DOING' || newStatus === 'CANCELLED';
    case 'Đang làm':
      return newStatus === 'COMPLETED';
    default:
      return false;
  }
};

function OrderItemDetail({
  orderItemId,
  fallbackName,
}: {
  orderItemId: number;
  fallbackName: string;
}) {
  const { data: orderItemData, isLoading } =
    useGetOrderItemByIdQuery(orderItemId);

  if (isLoading) {
    return <div className="animate-pulse">{fallbackName}</div>;
  }

  return <div>{orderItemData?.data?.dish?.name || fallbackName}</div>;
}

export default function OrderCard({
  order,
  refetchOrders,
  orderNumber,
}: OrderCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateOrderItemStatus] = useUpdateOrderItemStatusMutation();
  const { data: staffData } = useGetStaffByIdQuery(order.staffId.toString());
  const [currentTime, setCurrentTime] = useState(new Date());
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getTimeElapsed = (dateString: string) => {
    try {
      const orderDate = parseISO(dateString);
      const minutes = differenceInMinutes(currentTime, orderDate);

      if (minutes < 60) {
        return `${minutes} phút`;
      } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} giờ ${remainingMinutes} phút`;
      }
    } catch (error) {
      return 'không xác định';
    }
  };

  const flashCard = () => {
    if (cardRef.current) {
      cardRef.current.classList.add('flash-animation');
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.classList.remove('flash-animation');
        }
      }, 1000);
    }
  };

  const handleUpdateItemStatus = async (
    itemId: number,
    newStatus: OrderItemStatus,
    currentStatus: string,
  ) => {
    try {
      if (!isValidStatusTransition(currentStatus, newStatus)) {
        throw new Error('Không thể chuyển sang trạng thái này');
      }

      setIsLoading(true);
      setError(null);

      const result = await updateOrderItemStatus({
        id: itemId,
        data: { status: newStatus },
      }).unwrap();


      flashCard();
      refetchOrders();
    } catch (err: any) {
      console.error('Lỗi khi cập nhật trạng thái món ăn:', err);
      setError(
        err.message ||
          'Không thể cập nhật trạng thái món ăn. Vui lòng thử lại sau.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đang chờ':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Đang xử lý':
      case 'Đang làm':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Đã hoàn thành':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Đã hủy':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'HH:mm - dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  const filteredItems = order.orderItems.filter(
    item => item.dish?.requiresPreparation === true
  );

  const hasVisibleItems = filteredItems.some(
    item =>
      item.statusLabel !== 'Đã hoàn thành' &&
      item.statusLabel !== 'Đã hủy' &&
      item.statusLabel !== 'Đã giao'
  );


  if (!hasVisibleItems) {
    return null;
  }

  return (
    <div
      ref={cardRef}
      className="border border-gray-300 rounded-lg overflow-hidden bg-white h-full"
    >
      <div className="border-b border-gray-300 bg-amber-50 px-2.5 py-2">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium text-amber-800">Phiếu vào bếp</span>
          <div className="text-right text-xs text-gray-600">
            {staffData?.data?.username || 'admin'}
          </div>
        </div>
        <div className="font-medium">
          <div className="text-gray-600 text-xs">
            {formatTime(order.createdAt)}
          </div>
          <div className="text-gray-600 text-xs">
            Bàn: {order.tables.map(table => table.tableNumber).join(', ')}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 grid grid-cols-12 bg-gray-50">
        <div className="col-span-5 px-2.5 py-1.5 font-medium border-r border-gray-300 text-xs">
          Món
        </div>
        <div className="col-span-2 px-2 py-1.5 font-medium border-r border-gray-300 text-center text-xs">
          SL
        </div>
        <div className="col-span-5 px-2 py-1.5 font-medium text-center text-xs">
          Trạng thái
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="m-2 py-1.5 text-xs">
          <AlertCircle className="h-3 w-3 mr-1.5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400">
        {filteredItems.map((item: OrderItem, index: number) => {
          if (
            item.statusLabel === 'Đã hoàn thành' ||
            item.statusLabel === 'Đã hủy' ||
            item.statusLabel === 'Đã giao'
          ) {
            return null;
          }

          return (
            <div
              key={`${item.orderId}-${item.menuItemId}-${index}`}
              className={`grid grid-cols-12 border-b border-gray-200 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <div className="col-span-5 px-2.5 py-2 border-r border-gray-200 text-xs overflow-hidden whitespace-nowrap text-ellipsis">
                {item.dish?.name || (
                  <OrderItemDetail
                    orderItemId={item.orderItemId}
                    fallbackName={`Món #${item.menuItemId}`}
                  />
                )}
              </div>
              <div className="col-span-2 px-2 py-2 border-r border-gray-200 text-center text-xs">
                {item.quantity}
              </div>
              <div className="col-span-5 px-2 py-2 flex justify-between items-center">
                <Badge
                  variant="outline"
                  className={`${getStatusColor(
                    item.statusLabel,
                  )} text-[10px] px-1.5 py-0.5 ml-2 whitespace-nowrap`}
                >
                  {item.statusLabel}
                </Badge>

                <div className="flex space-x-1">
                  {item.statusLabel === 'Đang chờ' && (
                    <>
                      <Toggle
                        aria-label="Bắt đầu làm món"
                        className="h-6 w-6 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                        onClick={() =>
                          handleUpdateItemStatus(
                            item.orderItemId,
                            'DOING',
                            item.statusLabel,
                          )
                        }
                        disabled={isLoading}
                      >
                        <ChefHat className="h-3.5 w-3.5" />
                      </Toggle>
                      <Toggle
                        aria-label="Hủy món"
                        className="h-6 w-6 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                        onClick={() =>
                          handleUpdateItemStatus(
                            item.orderItemId,
                            'CANCELLED',
                            item.statusLabel,
                          )
                        }
                        disabled={isLoading}
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Toggle>
                    </>
                  )}
                  {item.statusLabel === 'Đang làm' && (
                    <Toggle
                      aria-label="Hoàn thành món"
                      className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() =>
                        handleUpdateItemStatus(
                          item.orderItemId,
                          'COMPLETED',
                          item.statusLabel,
                        )
                      }
                      disabled={isLoading}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Toggle>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        .flash-animation {
          animation: flash 1s;
        }

        @keyframes flash {
          0% {
            background-color: rgba(250, 204, 21, 0.4);
          }
          100% {
            background-color: transparent;
          }
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 2px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}