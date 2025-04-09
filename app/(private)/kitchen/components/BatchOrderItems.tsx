import { useState, useMemo } from 'react';
import {
  Order,
  OrderItem,
  statusLabelToEnum,
  enumToStatusLabel,
} from '@/features/order-cashier/types';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { useBatchUpdateOrderItemStatusMutation } from '@/features/order-cashier/orderCashierApiSlice';

interface BatchOrderItemsProps {
  orders: Order[];
  refetchOrders: () => void;
}

interface GroupedDish {
  dishId: number;
  dishName: string;
  totalQuantity: number;
  orderCount: number;
  orderItems: {
    orderItemId: number;
    orderId: number;
    tableNumber: string;
    quantity: number;
    status: string;
  }[];
}

export default function BatchOrderItems({
  orders,
  refetchOrders,
}: BatchOrderItemsProps) {
  const [batchUpdateOrderItemStatus] = useBatchUpdateOrderItemStatusMutation();
  const [expandedDishes, setExpandedDishes] = useState<Set<number>>(new Set());

  // Gom nhóm các món giống nhau
  const groupedDishes = useMemo(() => {
    const groups: GroupedDish[] = [];
    const dishMap = new Map<number, GroupedDish>();

    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const statusLabel = item.statusLabel || 'Đang chờ';
        const statusEnum = statusLabelToEnum[statusLabel] || 'PENDING';

        if ((statusEnum === 'PENDING' || statusEnum === 'DOING') && item.dish) {
          const dishId = item.dish.id;

          if (!dishMap.has(dishId)) {
            dishMap.set(dishId, {
              dishId,
              dishName: item.dish.name,
              totalQuantity: 0,
              orderCount: 0,
              orderItems: [],
            });
          }

          const group = dishMap.get(dishId)!;
          group.totalQuantity += item.quantity;
          group.orderItems.push({
            orderItemId: item.orderItemId,
            orderId: order.id,
            tableNumber: order.tables.map(t => t.tableNumber).join(', '),
            quantity: item.quantity,
            status: statusLabel,
          });
        }
      });
    });

    dishMap.forEach(group => {
      group.orderCount = group.orderItems.length;
    });

    const filteredGroups = Array.from(dishMap.values()).filter(
      group => group.orderCount > 1,
    );

    console.log('Grouped Dishes:', filteredGroups);
    return filteredGroups;
  }, [orders]);

  const toggleExpand = (dishId: number) => {
    setExpandedDishes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dishId)) {
        newSet.delete(dishId);
      } else {
        newSet.add(dishId);
      }
      return newSet;
    });
  };

  const handleBatchStart = async (dish: GroupedDish) => {
    try {
      const orderItemIds = dish.orderItems.map(item => item.orderItemId);
      const response = await batchUpdateOrderItemStatus({
        status: 'DOING',
        orderItemIds,
      }).unwrap();
      console.log('Batch Start Response:', response);
      refetchOrders();
    } catch (error) {
      console.error('Error starting batch:', error);
    }
  };

  const handleBatchComplete = async (dish: GroupedDish) => {
    try {
      const orderItemIds = dish.orderItems.map(item => item.orderItemId);
      const response = await batchUpdateOrderItemStatus({
        status: 'COMPLETED',
        orderItemIds,
      }).unwrap();
      console.log('Batch Complete Response:', response);
      refetchOrders();
    } catch (error) {
      console.error('Error completing batch:', error);
    }
  };

  if (groupedDishes.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-semibold text-zinc-800">
          Món nên làm chung
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groupedDishes.map(dish => {
          const groupStatus = dish.orderItems[0]?.status || 'Đang chờ';
          const groupStatusEnum = statusLabelToEnum[groupStatus] || 'PENDING';

          return (
            <div
              key={dish.dishId}
              className="border border-gray-200 rounded-lg bg-white overflow-hidden"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-zinc-800">
                      {dish.dishName}
                    </h3>
                    <div className="text-sm text-zinc-500">
                      Tổng số: {dish.totalQuantity} | Số đơn hàng:{' '}
                      {dish.orderCount}
                    </div>
                    <div className="text-sm text-zinc-600 mt-1">
                      Trạng thái: {groupStatus}
                    </div>
                  </div>
                  {groupStatusEnum === 'PENDING' ? (
                    <Button
                      onClick={() => handleBatchStart(dish)}
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      Bắt đầu
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleBatchComplete(dish)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Hoàn thành
                    </Button>
                  )}
                </div>
                <button
                  onClick={() => toggleExpand(dish.dishId)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {expandedDishes.has(dish.dishId) ? 'Thu gọn' : 'Chi tiết'}
                </button>
                {expandedDishes.has(dish.dishId) && (
                  <div className="mt-2">
                    {/* Header Row */}
                    <div className="grid grid-cols-3 gap-2 text-sm font-medium text-zinc-700 bg-gray-100 p-2 rounded-t">
                      <div>Bàn</div>
                      <div className="text-center">SL</div>
                      <div className="text-right">Trạng thái</div>
                    </div>
                    {/* Scrollable Content */}
                    <div className="max-h-40 overflow-y-auto">
                      {dish.orderItems.map(item => (
                        <div
                          key={item.orderItemId}
                          className="grid grid-cols-3 gap-2 text-sm p-2 border-b border-gray-200"
                        >
                          <div>{item.tableNumber}</div>
                          <div className="text-center">{item.quantity}</div>
                          <div className="text-right">{item.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
