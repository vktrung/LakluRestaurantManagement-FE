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
  type?: 'completed' | 'cancelled'; // Add type to differentiate notifications
  staffId?: number; // Staff ID associado à notificação
  isPriority?: boolean; // Indica se é uma notificação prioritária para o usuário atual
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addTestNotification: () => void;
  markAsDelivered: (id: string) => Promise<void>;
  dismissNotification: (id: string) => void; // Add new function to dismiss cancelled notifications
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// Constants
const DISMISSED_NOTIFICATION_IDS_KEY = 'laklu-dismissed-notification-ids';

// Lấy token từ cookie để kiểm tra auth
const getAuthToken = () => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match('(^|;)\\s*auth_token\\s*=\\s*([^;]+)');
    return match ? match.pop() : null;
  }
  return null;
};

// Helper function to load dismissed notification IDs from localStorage
const loadDismissedNotificationIds = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem(DISMISSED_NOTIFICATION_IDS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading dismissed notification IDs:', error);
    return [];
  }
};

// Helper function to save dismissed notification ID to localStorage
const saveDismissedNotificationId = (id: string): void => {
  if (typeof window === 'undefined') return;

  try {
    const savedIds = loadDismissedNotificationIds();
    if (!savedIds.includes(id)) {
      savedIds.push(id);
      localStorage.setItem(
        DISMISSED_NOTIFICATION_IDS_KEY,
        JSON.stringify(savedIds),
      );
    }
  } catch (error) {
    console.error('Error saving dismissed notification ID:', error);
  }
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [processedOrderItemIds, setProcessedOrderItemIds] = useState<
    Set<number>
  >(new Set());
  const [processedCancelledItemIds, setProcessedCancelledItemIds] = useState<
    Set<number>
  >(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<
    string[]
  >([]);

  // Sử dụng useRef để tránh re-render không cần thiết
  const processedOrderItemIdsRef = useRef<Set<number>>(new Set());
  const processedCancelledItemIdsRef = useRef<Set<number>>(new Set());
  const notificationIdsRef = useRef<Set<string>>(new Set());
  const authTokenRef = useRef<string | null>(getAuthToken() || null);
  const dismissedNotificationIdsRef = useRef<string[]>([]);

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

  // Load dismissed notification IDs from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedIds = loadDismissedNotificationIds();
      setDismissedNotificationIds(savedIds);
      dismissedNotificationIdsRef.current = savedIds;
    }
  }, []);

  // Đồng bộ refs với states
  useEffect(() => {
    processedOrderItemIdsRef.current = processedOrderItemIds;
  }, [processedOrderItemIds]);

  useEffect(() => {
    processedCancelledItemIdsRef.current = processedCancelledItemIds;
  }, [processedCancelledItemIds]);

  useEffect(() => {
    notificationIdsRef.current = new Set(notifications.map(n => n.id));
  }, [notifications]);

  useEffect(() => {
    dismissedNotificationIdsRef.current = dismissedNotificationIds;
  }, [dismissedNotificationIds]);

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
    // Kiểm tra xem có đang ở trang login không
    if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
      // Nếu đang ở trang login, không gọi API
      return;
    }

    // Gọi lại dữ liệu mỗi 5 giây nếu đã có userData
    const dataRefreshInterval = setInterval(() => {
      // Kiểm tra lại đường dẫn hiện tại mỗi lần gọi API để tránh gọi khi ở trang login
      if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
        return;
      }

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

    // ID của staff đang đăng nhập
    const currentStaffId = userData.data.id;

    // Lấy tất cả OrderItem IDs đã có trạng thái DELIVERED
    const deliveredOrderItemIds = new Set<number>();
    // Danh sách thông báo mới cần thêm vào
    const newNotificationsToAdd: Notification[] = [];
    // Danh sách orderItemIds đã xử lý mới
    const newProcessedIds = new Set<number>(processedOrderItemIdsRef.current);
    // Danh sách orderItemIds đã hủy đã xử lý
    const newProcessedCancelledIds = new Set<number>(
      processedCancelledItemIdsRef.current,
    );

    // Xử lý tất cả đơn hàng để tìm các món đã hoàn thành, đã giao và đã hủy
    ordersData.data.forEach(order => {
      // Kiểm tra xem order có phải của nhân viên hiện tại không
      const isStaffOrder = order.staffId === currentStaffId;

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
              type: 'completed',
              staffId: order.staffId,
              isPriority: isStaffOrder, // Đánh dấu là ưu tiên nếu là order của nhân viên hiện tại
            });

            // Đánh dấu là đã xử lý
            newProcessedIds.add(item.orderItemId);
          }
        }

        // Tạo thông báo cho các món đã hủy nhưng chưa được xử lý
        if (
          item.statusLabel === 'Đã hủy' &&
          !processedCancelledItemIdsRef.current.has(item.orderItemId) &&
          item.dish // Đảm bảo có thông tin món ăn
        ) {
          const notificationId = `cancelled-item-${item.orderItemId}`;

          // Kiểm tra xem thông báo đã tồn tại chưa và chưa được đóng trước đó
          if (
            !notificationIdsRef.current.has(notificationId) &&
            !dismissedNotificationIdsRef.current.includes(notificationId)
          ) {
            const tableNames = order.tables
              ? order.tables.map(t => t.tableNumber).join(', ')
              : '';

            newNotificationsToAdd.push({
              id: notificationId,
              message: `Món ăn "${item.dish.name}" ở bàn "${tableNames}" với số lượng "${item.quantity}" đã bị hủy`,
              read: false,
              timestamp: new Date().toISOString(),
              orderItemId: item.orderItemId,
              type: 'cancelled',
              staffId: order.staffId,
              isPriority: isStaffOrder, // Đánh dấu là ưu tiên nếu là order của nhân viên hiện tại
            });

            // Đánh dấu là đã xử lý
            newProcessedCancelledIds.add(item.orderItemId);
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
            deliveredOrderItemIds.has(notification.orderItemId) &&
            notification.type === 'completed'
          );
        });

        // Lọc ra các thông báo đã bị dismiss trước đó
        const filteredByDismissed = filteredNotifications.filter(
          notification => {
            // Nếu là thông báo hủy, kiểm tra xem đã được đóng trước đó chưa
            if (notification.type === 'cancelled') {
              return !dismissedNotificationIdsRef.current.includes(
                notification.id,
              );
            }
            // Các loại thông báo khác giữ nguyên
            return true;
          },
        );

        // Thêm các thông báo mới
        const combinedNotifications = [
          ...newNotificationsToAdd,
          ...filteredByDismissed,
        ];

        // Sắp xếp để các thông báo có isPriority=true hiển thị trước
        combinedNotifications.sort((a, b) => {
          // Ưu tiên 1: Thông báo ưu tiên lên trước
          if (a.isPriority && !b.isPriority) return -1;
          if (!a.isPriority && b.isPriority) return 1;

          // Ưu tiên 2: Theo thời gian (mới nhất lên đầu)
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        });

        return combinedNotifications;
      });
    }

    // 2. Cập nhật danh sách các món đã xử lý
    if (newProcessedIds.size > processedOrderItemIdsRef.current.size) {
      setProcessedOrderItemIds(newProcessedIds);
    }

    // 3. Cập nhật danh sách các món đã hủy đã xử lý
    if (
      newProcessedCancelledIds.size > processedCancelledItemIdsRef.current.size
    ) {
      setProcessedCancelledItemIds(newProcessedCancelledIds);
    }
  }, [ordersData, userData]);

  // TEST FUNCTION
  const addTestNotification = useCallback(() => {
    const newNotification: Notification = {
      id: `test-${Date.now()}`,
      message: `Món ăn "Test món" ở bàn "D01" đã hoàn thành, đến lấy món ăn`,
      read: false,
      timestamp: new Date().toISOString(),
      type: 'completed' as const,
      staffId: userData?.data?.id,
      isPriority: true,
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, [userData?.data?.id]);

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
      if (!notification?.orderItemId || notification.type !== 'completed')
        return;

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

  // Function to dismiss cancelled notification and save to localStorage
  const dismissNotification = useCallback(
    (id: string) => {
      const notification = notifications.find(n => n.id === id);

      // Chỉ lưu vào localStorage nếu là thông báo hủy món
      if (notification?.type === 'cancelled') {
        saveDismissedNotificationId(id);

        // Cập nhật state để lần sau không hiển thị lại
        setDismissedNotificationIds(prev => {
          if (prev.includes(id)) return prev;
          return [...prev, id];
        });
      }

      // Xóa thông báo khỏi danh sách hiện tại
      setNotifications(prev => prev.filter(n => n.id !== id));
    },
    [notifications],
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
        dismissNotification,
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
