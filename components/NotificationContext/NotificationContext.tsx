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
  useRef,
} from 'react';
import { useGetOrdersEveningToDawnQuery } from '@/features/order-cashier/orderCashierApiSlice';
import { useGetUserMeQuery } from '@/features/auth/authApiSlice';
import { useUpdateOrderItemStatusMutation } from '@/features/order-cashier/orderCashierApiSlice';
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

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// Lấy token từ cookie để kiểm tra auth
const getAuthToken = () => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match('(^|;)\\s*auth_token\\s*=\\s*([^;]+)');
    return match ? match.pop() : null;
  }
  return null;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [processedOrderItemIds, setProcessedOrderItemIds] = useState<
    Set<number>
  >(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // Sử dụng useRef để tránh re-render không cần thiết
  const processedOrderItemIdsRef = useRef<Set<number>>(new Set());
  const notificationIdsRef = useRef<Set<string>>(new Set());
  const authTokenRef = useRef<string | null>(getAuthToken() || null);

  const [updateOrderItemStatus] = useUpdateOrderItemStatusMutation();

  // API calls
  const {
    data: userData,
    refetch: refetchUser,
    isSuccess: isUserSuccess,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetUserMeQuery();

  const {
    data: ordersData,
    refetch: refetchOrders,
    error: ordersError,
    isSuccess: isOrdersSuccess,
    isLoading: isOrdersLoading,
  } = useGetOrdersEveningToDawnQuery(undefined, {
    pollingInterval: 5000,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // Đồng bộ refs với states
  useEffect(() => {
    processedOrderItemIdsRef.current = processedOrderItemIds;
  }, [processedOrderItemIds]);

  useEffect(() => {
    notificationIdsRef.current = new Set(notifications.map(n => n.id));
  }, [notifications]);

  // Kiểm tra và cập nhật token khi component mount
  useEffect(() => {
    const token = getAuthToken();
    authTokenRef.current = token || null;
  }, []);

  // Khi userData thay đổi, fetch orders nếu đã có userData
  useEffect(() => {
    if (userData?.data && !isInitialized) {
      setIsInitialized(true);
    }
  }, [userData, isInitialized]);

  // Định kỳ kiểm tra token và fetch data
  useEffect(() => {
    // Gọi lại dữ liệu mỗi 5 giây nếu đã có userData
    const dataRefreshInterval = setInterval(() => {
      const token = getAuthToken();

      // Nếu có token mới (vừa đăng nhập) nhưng chưa có userData, gọi getUserMe
      if (token && !userData) {
        refetchUser();
      }

      // Nếu đã có userData, gọi getOrders
      if (userData?.data) {
        refetchOrders();
      }
    }, 5000);

    return () => {
      clearInterval(dataRefreshInterval);
    };
  }, [userData, refetchUser, refetchOrders]);

  // Retry khi có lỗi
  useEffect(() => {
    if (ordersError) {
      setTimeout(() => {
        if (userData?.data) {
          refetchOrders();
        }
      }, 1000);
    }
  }, [ordersError, refetchOrders, userData]);

  // Xử lý thông báo
  useEffect(() => {
    if (!ordersData?.data || !userData?.data) {
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
    // Danh sách thông báo mới cần thêm vào
    const newNotificationsToAdd: Notification[] = [];
    // Danh sách orderItemIds đã xử lý mới
    const newProcessedIds = new Set<number>(processedOrderItemIdsRef.current);

    // Xử lý tất cả đơn hàng để tìm các món đã hoàn thành và đã giao
    ordersData.data.forEach(order => {
      order.orderItems.forEach(item => {
        // Thêm các món đã giao vào danh sách để lọc ra khỏi thông báo
        if (item.statusLabel === 'Đã giao') {
          deliveredOrderItemIds.add(item.orderItemId);
        }

        // Tạo thông báo cho các món đã hoàn thành nhưng chưa được xử lý
        if (
          item.statusLabel === 'Đã hoàn thành' &&
          !processedOrderItemIdsRef.current.has(item.orderItemId) &&
          !deliveredOrderItemIds.has(item.orderItemId) &&
          item.dish // Đảm bảo có thông tin món ăn
        ) {
          const notificationId = `order-item-${item.orderItemId}`;

          // Kiểm tra xem thông báo đã tồn tại chưa
          if (!notificationIdsRef.current.has(notificationId)) {
            const tableNames = order.tables
              ? order.tables.map(t => t.tableNumber).join(', ')
              : '';

            newNotificationsToAdd.push({
              id: notificationId,
              message: `Món ăn "${item.dish.name}" ở bàn "${tableNames}" với số lượng "${item.quantity}" đã hoàn thành, đến lấy món ăn`,
              read: false,
              timestamp: new Date().toISOString(),
              orderItemId: item.orderItemId,
            });

            // Đánh dấu là đã xử lý
            newProcessedIds.add(item.orderItemId);
          }
        }
      });
    });

    // Thực hiện các cập nhật state trong một lần duy nhất để tránh vòng lặp vô hạn

    // 1. Cập nhật danh sách thông báo: xóa các thông báo đã giao và thêm các thông báo mới
    if (deliveredOrderItemIds.size > 0 || newNotificationsToAdd.length > 0) {
      setNotifications(prev => {
        // Lọc các thông báo đã giao
        const filteredNotifications = prev.filter(notification => {
          return !(
            notification.orderItemId &&
            deliveredOrderItemIds.has(notification.orderItemId)
          );
        });

        // Thêm các thông báo mới
        return [...newNotificationsToAdd, ...filteredNotifications];
      });
    }

    // 2. Cập nhật danh sách các món đã xử lý
    if (newProcessedIds.size > processedOrderItemIdsRef.current.size) {
      setProcessedOrderItemIds(newProcessedIds);
    }
  }, [ordersData, userData]);

  // TEST FUNCTION
  const addTestNotification = useCallback(() => {
    const newNotification = {
      id: `test-${Date.now()}`,
      message: `Món ăn "Test món" ở bàn "D01" đã hoàn thành, đến lấy món ăn`,
      read: false,
      timestamp: new Date().toISOString(),
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

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
          if (userData?.data) {
            refetchOrders();
          }
        }, 500);
      } catch (error) {
        console.error('Failed to update order item status:', error);
      }
    },
    [notifications, updateOrderItemStatus, refetchOrders, userData],
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
