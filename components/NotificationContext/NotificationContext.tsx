// components/NotificationContext/NotificationContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { useGetOrdersEveningToDawnQuery } from '@/features/order-cashier/orderCashierApiSlice';
import { useGetUserMeQuery } from '@/features/auth/authApiSlice';
import {
  useGetOrderItemByIdQuery,
  useUpdateOrderItemStatusMutation,
} from '@/features/order-cashier/orderCashierApiSlice';
import {
  Order,
  OrderItem,
  OrderItemStatus,
} from '@/features/order-cashier/types';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
  orderItemId?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addTestNotification: () => void;
  markAsDelivered: (id: string) => Promise<void>;
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

  const [updateOrderItemStatus] = useUpdateOrderItemStatusMutation();

  // Lấy token từ cookie để kiểm tra auth
  const getAuthToken = () => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(
        '(^|;)\\s*auth_token\\s*=\\s*([^;]+)',
      );
      return match ? match.pop() : null;
    }
    return null;
  };

  // API calls
  const { data: userData, refetch: refetchUser } = useGetUserMeQuery();
  const { data: ordersData, refetch: refetchOrders, error: ordersError } = useGetOrdersEveningToDawnQuery(undefined, {
    pollingInterval: 10000, // Poll every 2 seconds
    refetchOnMountOrArgChange: true,
    skip: !userData?.data, // Skip polling if user data is not available
    refetchOnFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when reconnected to network
  });

  // Force refetch when component mounts
  useEffect(() => {
    if (userData?.data) {
      refetchOrders();
    }
  }, [userData?.data, refetchOrders]);

  useEffect(() => {
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      // Retry on error
      setTimeout(() => {
        refetchOrders();
      }, 1000);
    }
  }, [ordersError, refetchOrders]);

  useEffect(() => {
    if (ordersData) {
      console.log('Orders data updated:', new Date().toISOString(), ordersData);
    }
  }, [ordersData]);

  // Fetch user data khi có token
  useEffect(() => {
    const token = getAuthToken();
    if (token && !userData) {
      refetchUser();
    }
  }, [userData, refetchUser]);

  // Xử lý thông báo
  useEffect(() => {
    if (!ordersData?.data) {
      return;
    }

    // Nếu chưa có userData, đợi userData
    if (!userData?.data) {
      return;
    }

    // Kiểm tra xem user có quyền nhận thông báo không
    const hasNotificationPermission = userData.data.permissions.includes(
      'order_items:get_noti',
    );
    if (!hasNotificationPermission) {
      return;
    }

    // Lấy tất cả OrderItem IDs đã có trạng thái DELIVERED
    const deliveredOrderItemIds = new Set<number>();
    ordersData.data.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.statusLabel === 'Đã giao') {
          deliveredOrderItemIds.add(item.orderItemId);
        }
      });
    });

    console.log('deliveredOrderItemIds', ordersData);
    console.log('deliveredOrderItemIds', deliveredOrderItemIds);

    // Loại bỏ thông báo cho các OrderItem đã được đánh dấu DELIVERED
    setNotifications(prev =>
      prev.filter(notification => deliveredOrderItemIds.has(notification.orderItemId!)),
    );

    const newPendingNotifications: {
      id: string;
      tableNames: string;
      quantity: number;
      orderItemId: number;
      isProcessing: boolean;
    }[] = [];

    // Lọc các món đã hoàn thành chưa được xử lý
    ordersData.data.forEach(order => {
      order.orderItems.forEach(item => {
        if (
          item.statusLabel === 'Đã hoàn thành' &&
          !processedOrderItemIds.has(item.orderItemId) &&
          !deliveredOrderItemIds.has(item.orderItemId)
        ) {
          const notificationId = `item-${item.orderItemId}`;
          const tableNames = order.tables
            ? order.tables.map(t => t.tableNumber).join(', ')
            : '';

          newPendingNotifications.push({
            id: notificationId,
            tableNames,
            quantity: item.quantity,
            orderItemId: item.orderItemId,
            isProcessing: false,
          });
        }
      });
    });

    // Cập nhật danh sách chờ một lần duy nhất
    if (newPendingNotifications.length > 0) {
      setPendingNotifications(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const uniqueNewItems = newPendingNotifications.filter(
          item => !existingIds.has(item.id),
        );
        return [...prev, ...uniqueNewItems];
      });

      // Cập nhật processedOrderItemIds một lần
      setProcessedOrderItemIds(prev => {
        const newSet = new Set(prev);
        newPendingNotifications.forEach(item => {
          newSet.add(item.orderItemId);
        });
        return newSet;
      });
    }
  }, [ordersData, userData, processedOrderItemIds]);

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

  // Xử lý tên món ăn và tạo thông báo
  const handleNameFetched = useCallback(
    (
      id: string,
      tableNames: string,
      quantity: number,
      dishName: string,
      orderItemId: number,
    ) => {
      setPendingNotifications(prev => prev.filter(item => item.id !== id));

      setNotifications(prev => {
        const notificationId = `order-${id}`;
        if (prev.some(notif => notif.id === notificationId)) {
          return prev;
        }

        const newNotification = {
          id: notificationId,
          message: `Món ăn "${dishName}" ở bàn "${tableNames}" với số lượng "${quantity}" đã hoàn thành, đến lấy món ăn`,
          read: false,
          timestamp: new Date().toISOString(),
          orderItemId: orderItemId,
        };

        return [newNotification, ...prev];
      });
    },
    [],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  const markAsDelivered = useCallback(
    async (id: string) => {
      const notification = notifications.find(n => n.id === id);
      if (!notification?.orderItemId) return;

      try {
        await updateOrderItemStatus({
          id: notification.orderItemId,
          data: { status: 'DELIVERED' as OrderItemStatus },
        }).unwrap();

        // Xóa thông báo ngay lập tức ở client này
        setNotifications(prev => prev.filter(n => n.id !== id));

        // Fetch lại dữ liệu để các client khác có thể cập nhật
        setTimeout(() => {
          refetchOrders();
        }, 500);
      } catch (error) {
        console.error('Failed to update order item status:', error);
      }
    },
    [notifications, updateOrderItemStatus, refetchOrders],
  );

  const unreadCount = useMemo(
    () => notifications.filter(notif => !notif.read).length,
    [notifications],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addTestNotification,
        markAsDelivered,
      }}
    >
      {pendingNotifications
        .filter(item => !item.isProcessing)
        .map(item => (
          <OrderItemNameFetcher
            key={item.id}
            orderItemId={item.orderItemId}
            onNameFetched={name =>
              handleNameFetched(
                item.id,
                item.tableNames,
                item.quantity,
                name,
                item.orderItemId,
              )
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
