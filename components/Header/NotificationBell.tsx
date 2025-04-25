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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export function NotificationBell({ isMobile = false }: { isMobile?: boolean }) {
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
    event.stopPropagation();
    await markAsDelivered(id);
  };

  const handleDismiss = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    dismissNotification(id);
  };

  const filteredNotifications =
    activeTab === 'mine'
      ? notifications.filter(n => n.isPriority)
      : notifications;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative',
            isMobile
              ? 'flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              : '',
          )}
        >
          <Bell className={cn(isMobile ? 'h-5 w-5' : 'h-5 w-5')} />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute flex items-center justify-center rounded-full bg-red-500 text-[10px] text-white',
                isMobile ? 'top-0 -right-2 h-4 w-4' : '-top-1 -right-1 h-5 w-5',
              )}
            >
              {unreadCount}
            </span>
          )}
          {isMobile && <span className="text-xs mt-0.5">Thông báo</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          'p-0 bg-white dark:bg-slate-900 rounded-lg shadow-lg',
          isMobile
            ? 'w-[90vw] max-w-[360px] max-h-[60vh] mt-2 mx-4' // Thêm margin và giới hạn max-height
            : 'w-80 max-h-[80vh]',
          'overflow-y-auto',
        )}
      >
        <DropdownMenuLabel className="p-3 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <span className="text-sm font-semibold">Thông báo</span>
        </DropdownMenuLabel>

        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-2 w-full rounded-none px-3">
            <TabsTrigger value="all" className="text-xs">Tất cả</TabsTrigger>
            <TabsTrigger value="mine" className="text-xs">Của tôi</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="m-0">
            {renderNotificationList(notifications)}
          </TabsContent>

          <TabsContent value="mine" className="m-0">
            {renderNotificationList(notifications.filter(n => n.isPriority))}
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  function renderNotificationList(notificationList: any[]) {
    if (notificationList.length === 0) {
      return (
        <div className="py-4 px-3 text-center text-gray-500 text-sm">
          Không có thông báo nào
        </div>
      );
    }

    const priorityNotifications = notificationList.filter(n => n.isPriority);
    const normalNotifications = notificationList.filter(n => !n.isPriority);

    return (
      <div className="pt-1 pb-2">
        {priorityNotifications.length > 0 && (
          <>
            {priorityNotifications.map(renderNotificationItem)}
            {normalNotifications.length > 0 && (
              <div className="px-3 py-2">
                <div className="border-t border-gray-200"></div>
              </div>
            )}
          </>
        )}
        {normalNotifications.map(renderNotificationItem)}
      </div>
    );
  }

  function renderNotificationItem(notification: any) {
    return (
      <DropdownMenuItem
        key={notification.id}
        className={cn(
          'p-3 cursor-pointer relative',
          !notification.read ? 'bg-amber-50' : '',
          notification.isPriority ? 'border-l-4 border-blue-500 pl-2' : '',
          isMobile ? 'text-sm' : '',
        )}
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
              className={cn(
                'text-sm',
                !notification.read ? 'font-semibold' : '',
                notification.type === 'cancelled' ? 'text-red-700' : '',
                notification.isPriority ? 'font-medium' : '',
                isMobile ? 'text-xs' : '',
              )}
            >
              {notification.message}
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span
              className={cn(
                'text-xs text-gray-500 flex items-center',
                isMobile ? 'text-[10px]' : '',
              )}
            >
              {formatTime(notification.timestamp)}
              {notification.isPriority && (
                <span
                  className={cn(
                    'ml-1 text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded',
                    isMobile ? 'text-[10px]' : '',
                  )}
                >
                  Của bạn
                </span>
              )}
            </span>

            {notification.type === 'completed' ? (
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-7 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-200',
                  isMobile ? 'h-6 text-[10px] px-2' : '',
                )}
                onClick={e => handleConfirm(notification.id, e)}
              >
                <Check className={cn('h-3.5 w-3.5 mr-1', isMobile ? 'h-3 w-3' : '')} />
                Xác nhận
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-7 text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 border-gray-200',
                  isMobile ? 'h-6 text-[10px] px-2' : '',
                )}
                onClick={e => handleDismiss(notification.id, e)}
              >
                <X className={cn('h-3.5 w-3.5 mr-1', isMobile ? 'h-3 w-3' : '')} />
                Đóng
              </Button>
            )}
          </div>
        </div>
      </DropdownMenuItem>
    );
  }
}