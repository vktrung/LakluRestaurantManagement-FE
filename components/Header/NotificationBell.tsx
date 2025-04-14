// components/Header/NotificationBell.tsx
'use client';

import React, { useState } from 'react';
import { Bell, Check, X, AlertCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '../NotificationContext/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsDelivered,
    dismissNotification,
  } = useNotifications();
  const [activeTab, setActiveTab] = useState<string>('all');

  const formatTime = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), 'HH:mm - dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return timestamp;
    }
  };

  const handleConfirm = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering markAsRead
    await markAsDelivered(id); // This will update status to DELIVERED and remove notification
  };

  const handleDismiss = (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering markAsRead
    dismissNotification(id); // Remove the cancelled notification
  };

  // Lọc thông báo theo tab đang chọn
  const filteredNotifications =
    activeTab === 'mine'
      ? notifications.filter(n => n.isPriority)
      : notifications;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto p-0"
      >
        <DropdownMenuLabel className="p-3">
          <span>Thông báo</span>
        </DropdownMenuLabel>

        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-2 w-full rounded-none">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="mine">Của tôi</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="m-0">
            {renderNotificationList(filteredNotifications)}
          </TabsContent>

          <TabsContent value="mine" className="m-0">
            {renderNotificationList(filteredNotifications)}
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  function renderNotificationList(notificationList: any[]) {
    if (notificationList.length === 0) {
      return (
        <div className="py-4 px-2 text-center text-gray-500">
          Không có thông báo nào
        </div>
      );
    }

    // Nhóm thông báo theo isPriority
    const priorityNotifications = notificationList.filter(n => n.isPriority);
    const normalNotifications = notificationList.filter(n => !n.isPriority);

    return (
      <div className="pt-1 pb-2">
        {/* Hiển thị thông báo ưu tiên */}
        {priorityNotifications.length > 0 && (
          <>
            {priorityNotifications.map(renderNotificationItem)}

            {/* Gạch ngang phân cách nếu có cả 2 loại thông báo */}
            {normalNotifications.length > 0 && (
              <div className="px-3 py-2">
                <div className="border-t border-gray-200"></div>
              </div>
            )}
          </>
        )}

        {/* Hiển thị thông báo thông thường */}
        {normalNotifications.map(renderNotificationItem)}
      </div>
    );
  }

  function renderNotificationItem(notification: any) {
    return (
      <DropdownMenuItem
        key={notification.id}
        className={`p-3 cursor-pointer relative ${
          !notification.read ? 'bg-amber-50' : ''
        } ${notification.isPriority ? 'border-l-4 border-blue-500 pl-2' : ''}`}
        onClick={() => markAsRead(notification.id)}
      >
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-start gap-2">
            {notification.type === 'cancelled' && (
              <AlertCircle className="text-red-500 h-4 w-4 mt-0.5 flex-shrink-0" />
            )}
            {notification.isPriority && (
              <Star className="text-blue-500 h-4 w-4 mt-0.5 flex-shrink-0" />
            )}
            <div
              className={`text-sm ${
                !notification.read ? 'font-semibold' : ''
              } ${notification.type === 'cancelled' ? 'text-red-700' : ''} ${
                notification.isPriority ? 'font-medium' : ''
              }`}
            >
              {notification.message}
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500 flex items-center">
              {formatTime(notification.timestamp)}
              {notification.isPriority && (
                <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">
                  Của bạn
                </span>
              )}
            </span>

            {notification.type === 'completed' ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-200"
                onClick={e => handleConfirm(notification.id, e)}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Xác nhận
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 border-gray-200"
                onClick={e => handleDismiss(notification.id, e)}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Đóng
              </Button>
            )}
          </div>
        </div>
      </DropdownMenuItem>
    );
  }
}
