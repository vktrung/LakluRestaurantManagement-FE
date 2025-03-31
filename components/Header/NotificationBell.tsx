// components/Header/NotificationBell.tsx
'use client';

import React from 'react';
import { Bell } from 'lucide-react';
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

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const formatTime = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), 'HH:mm - dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return timestamp;
    }
  };

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
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Thông báo</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              className="text-xs h-6 py-0 px-2" 
              onClick={markAllAsRead}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-4 px-2 text-center text-gray-500">
            Không có thông báo nào
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem 
              key={notification.id} 
              className={`p-3 cursor-pointer ${!notification.read ? 'bg-amber-50' : ''}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex flex-col gap-1 w-full">
                <div className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                  {notification.message}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTime(notification.timestamp)}
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}