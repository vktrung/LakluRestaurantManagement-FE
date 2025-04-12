'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Order,
  OrderItem,
  statusLabelToEnum,
  enumToStatusLabel,
} from '@/features/order-cashier/types';
import { Button } from '@/components/ui/button';
import { Clock, Ban } from 'lucide-react';
import {
  useBatchUpdateOrderItemStatusMutation,
  useUpdateOrderItemStatusMutation,
} from '@/features/order-cashier/orderCashierApiSlice';
import { Toggle } from '@/components/ui/toggle';

interface BatchOrderItemsProps {
  orders: Order[];
  refetchOrders: () => void;
}

interface GroupedDish {
  dishId: number;
  dishName: string;
  totalQuantity: number;
  orderCount: number;
  groupStatus: 'PENDING' | 'DOING';
  orderItems: {
    orderItemId: number;
    orderId: number;
    tableNumber: string;
    quantity: number;
    status: string;
  }[];
  key: string; // Thêm key để xác định nhóm
}

export default function BatchOrderItems({
  orders,
  refetchOrders,
}: BatchOrderItemsProps) {
  const [batchUpdateOrderItemStatus] = useBatchUpdateOrderItemStatusMutation();
  const [updateOrderItemStatus] = useUpdateOrderItemStatusMutation();
  const [expandedDishes, setExpandedDishes] = useState<Set<number>>(new Set());
  const [groupOrder, setGroupOrder] = useState<string[]>([]); // Lưu thứ tự ban đầu của các nhóm

  // Gom nhóm các món giống nhau, tách thành hai nhóm: PENDING và DOING
  const groupedDishes = useMemo(() => {
    const dishMap = new Map<string, GroupedDish>(); // Key: `${dishId}-${statusEnum}`

    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const statusLabel = item.statusLabel || 'Đang chờ';
        const statusEnum = statusLabelToEnum[statusLabel] || 'PENDING';

        if ((statusEnum === 'PENDING' || statusEnum === 'DOING') && item.dish) {
          const dishId = item.dish.id;
          const key = `${dishId}-${statusEnum}`; // Key duy nhất cho mỗi nhóm

          if (!dishMap.has(key)) {
            dishMap.set(key, {
              dishId,
              dishName: item.dish.name,
              totalQuantity: 0,
              orderCount: 0,
              groupStatus: statusEnum,
              orderItems: [],
              key, // Lưu key vào nhóm
            });
          }

          const group = dishMap.get(key)!;
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

    // Cập nhật orderCount cho từng nhóm
    dishMap.forEach(group => {
      group.orderCount = group.orderItems.length;
    });

    // Lọc các nhóm có nhiều hơn 1 món
    const filteredGroups = Array.from(dishMap.values()).filter(
      group => group.orderCount > 1
    );

    console.log('Grouped Dishes:', filteredGroups);
    return filteredGroups;
  }, [orders]);

  // Cập nhật thứ tự ban đầu của các nhóm
  useEffect(() => {
    setGroupOrder(prevOrder => {
      const currentKeys = groupedDishes.map(group => group.key);
      const newKeys = currentKeys.filter(key => !prevOrder.includes(key));
      return [...prevOrder, ...newKeys]; // Chỉ thêm các key mới, không xóa key cũ
    });
  }, [groupedDishes]);

  // Sắp xếp các nhóm theo thứ tự ban đầu
  const sortedGroups = useMemo(() => {
    return [...groupedDishes].sort((a, b) => {
      const indexA = groupOrder.indexOf(a.key);
      const indexB = groupOrder.indexOf(b.key);
      return indexA - indexB;
    });
  }, [groupedDishes, groupOrder]);

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

  const handleBatchCancel = async (dish: GroupedDish) => {
    try {
      const orderItemIds = dish.orderItems.map(item => item.orderItemId);
      const response = await batchUpdateOrderItemStatus({
        status: 'CANCELLED',
        orderItemIds,
      }).unwrap();
      console.log('Batch Cancel Response:', response);
      refetchOrders();
    } catch (error) {
      console.error('Error cancelling batch:', error);
    }
  };

  const handleCancelItem = async (orderItemId: number) => {
    try {
      const response = await updateOrderItemStatus({
        id: orderItemId,
        data: { status: 'CANCELLED' },
      }).unwrap();
      console.log(`Cancel Item ${orderItemId} Response:`, response);
      refetchOrders();
    } catch (error) {
      console.error(`Error cancelling item ${orderItemId}:`, error);
    }
  };

  if (sortedGroups.length === 0) {
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
        {sortedGroups.map(dish => {
          return (
            <div
              key={dish.key} // Sử dụng key của nhóm
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
                      Trạng thái: {dish.orderItems[0]?.status}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {dish.groupStatus === 'PENDING' ? (
                      <>
                        <Button
                          onClick={() => handleBatchStart(dish)}
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          Bắt đầu
                        </Button>
                        <Button
                          onClick={() => handleBatchCancel(dish)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Hủy
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleBatchComplete(dish)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Hoàn thành
                      </Button>
                    )}
                  </div>
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
                    <div className="grid grid-cols-4 gap-2 text-sm font-medium text-zinc-700 bg-gray-100 p-2 rounded-t">
                      <div>Bàn</div>
                      <div className="text-center">SL</div>
                      <div className="text-right">Trạng thái</div>
                      <div className="text-right">Hành động</div>
                    </div>
                    {/* Scrollable Content */}
                    <div className="max-h-40 overflow-y-auto">
                      {dish.orderItems.map(item => (
                        <div
                          key={item.orderItemId}
                          className="grid grid-cols-4 gap-2 text-sm p-2 border-b border-gray-200"
                        >
                          <div>{item.tableNumber}</div>
                          <div className="text-center">{item.quantity}</div>
                          <div className="text-right">{item.status}</div>
                          <div className="text-right">
                            {dish.groupStatus === 'PENDING' && (
                              <Toggle
                                aria-label="Hủy món"
                                className="h-6 w-6 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                onClick={() => handleCancelItem(item.orderItemId)}
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </Toggle>
                            )}
                          </div>
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