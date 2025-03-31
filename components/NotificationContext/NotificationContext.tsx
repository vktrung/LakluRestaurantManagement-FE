// components/NotificationContext/NotificationContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useGetOrdersQuery } from '@/features/order-cashier/orderCashierApiSlice';
import { useGetUserMeQuery } from '@/features/auth/authApiSlice';
import { useGetOrderItemByIdQuery } from '@/features/order-cashier/orderCashierApiSlice';
import { Order, OrderItem } from '@/features/order-cashier/types';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addTestNotification: () => void;
}

// Component để lấy tên món ăn từ orderItemId
function OrderItemNameFetcher({
  orderItemId,
  onNameFetched,
}: {
  orderItemId: number;
  onNameFetched: (name: string) => void;
}) {
  const { data: orderItemData } = useGetOrderItemByIdQuery(orderItemId);

  useEffect(() => {
    if (orderItemData?.data?.dish?.name) {
      onNameFetched(orderItemData.data.dish.name);
    }
  }, [orderItemData, onNameFetched]);

  return null; // This is a data-fetching component, no UI needed
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [processedOrderItemIds, setProcessedOrderItemIds] = useState<
    Set<number>
  >(new Set());
  const [pendingNotifications, setPendingNotifications] = useState<
    {
      id: string;
      tableNames: string;
      quantity: number;
      orderItemId: number;
      isProcessing: boolean;
    }[]
  >([]);

  // API calls
  const { data: ordersData } = useGetOrdersQuery(undefined, {
    pollingInterval: 10000,
  });

  const { data: userData } = useGetUserMeQuery();

  // TEST FUNCTION
  const addTestNotification = () => {
    const newNotification = {
      id: `test-${Date.now()}`,
      message: `Món ăn "Test món" ở bàn "D01" đã hoàn thành, đến lấy món ăn`,
      read: false,
      timestamp: new Date().toISOString(),
    };

    setNotifications(prev => [newNotification, ...prev]);
    console.log('Added test notification');
  };

  // Xử lý các thông báo đang chờ để lấy tên món ăn
  const handleNameFetched = useCallback(
    (id: string, tableNames: string, quantity: number, dishName: string) => {
      console.log(`Fetched dish name: ${dishName} for notification ${id}`);

      setPendingNotifications(prev =>
        prev.map(item =>
          item.id === id ? { ...item, isProcessing: true } : item,
        ),
      );

      // Tạo thông báo mới với tên món ăn đã lấy được
      const newNotification = {
        id: `order-${id}`,
        message: `Món ăn "${dishName}" ở bàn "${tableNames}" với số lượng "${quantity}" đã hoàn thành, đến lấy món ăn`,
        read: false,
        timestamp: new Date().toISOString(),
      };

      // Thêm thông báo vào danh sách
      setNotifications(prev => {
        // Kiểm tra nếu thông báo đã tồn tại (tránh trùng lặp)
        if (prev.some(notif => notif.id === newNotification.id)) {
          return prev;
        }
        return [newNotification, ...prev];
      });

      // Xóa khỏi danh sách chờ
      setPendingNotifications(prev => prev.filter(item => item.id !== id));
    },
    [],
  );

  // Kiểm tra các món đã hoàn thành để thông báo
  useEffect(() => {
    if (!ordersData?.data || !userData?.data) {
      return;
    }

    // Xóa localStorage để đảm bảo không còn dữ liệu cũ
    if (typeof window !== 'undefined') {
      localStorage.removeItem('notified_order_items');
    }

    const newPendingNotifications: {
      id: string;
      tableNames: string;
      quantity: number;
      orderItemId: number;
      isProcessing: boolean;
    }[] = [];

    // Duyệt qua từng đơn hàng
    ordersData.data.forEach(order => {
      // So sánh ID nhân viên - nếu đơn này thuộc về người đang đăng nhập
      if (String(order.staffId) === String(userData.data.id)) {
        // Kiểm tra từng món trong đơn
        order.orderItems.forEach(item => {
          // Nếu món đã hoàn thành và chưa được xử lý
          if (
            item.statusLabel === 'Đã hoàn thành' &&
            !processedOrderItemIds.has(item.orderItemId)
          ) {
            // Tạo ID ổn định cho món này
            const notificationId = `item-${item.orderItemId}`;

            // Kiểm tra xem món này đã trong danh sách chờ chưa
            const isAlreadyPending = pendingNotifications.some(
              pending => pending.id === notificationId,
            );

            // Chỉ thêm vào danh sách chờ nếu chưa có
            if (!isAlreadyPending) {
              // Thêm vào pending để chờ lấy tên món ăn
              const tableNames = order.tables
                .map(t => t.tableNumber)
                .join(', ');

              newPendingNotifications.push({
                id: notificationId,
                tableNames,
                quantity: item.quantity,
                orderItemId: item.orderItemId,
                isProcessing: false,
              });

              // Đánh dấu món này đã được xử lý
              setProcessedOrderItemIds(prev => {
                const newSet = new Set(prev);
                newSet.add(item.orderItemId);
                return newSet;
              });
            }
          }
        });
      }
    });

    // Cập nhật danh sách chờ thông báo
    if (newPendingNotifications.length > 0) {
      setPendingNotifications(prev => {
        // Lọc ra các món chưa được thêm vào danh sách chờ
        const newItems = newPendingNotifications.filter(
          newItem => !prev.some(existingItem => existingItem.id === newItem.id),
        );
        return [...prev, ...newItems];
      });
    }

    // Cleanup function to cancel pending operations
    return () => {
      console.log('Cleaning up notification effect');
    };
  }, [ordersData, userData, pendingNotifications, processedOrderItemIds]);

  // Các hàm xử lý thông báo
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addTestNotification,
      }}
    >
      {/* Render OrderItemNameFetcher components for each pending notification */}
      {pendingNotifications
        .filter(item => !item.isProcessing)
        .map(item => (
          <OrderItemNameFetcher
            key={item.id}
            orderItemId={item.orderItemId}
            onNameFetched={name =>
              handleNameFetched(item.id, item.tableNames, item.quantity, name)
            }
          />
        ))}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within NotificationProvider',
    );
  }
  return context;
};
