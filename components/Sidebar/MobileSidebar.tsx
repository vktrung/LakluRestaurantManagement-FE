'use client';

import Link from 'next/link';
import { useGetUserMeQuery } from '@/features/auth/authApiSlice';
import { useEffect } from 'react';
import { Table, ShoppingCart, CalendarDays, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function MobileSidebar() {
  const { data, isLoading, error, refetch } = useGetUserMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const userRoles = data?.data?.roleNames || [];
  const isWaiter = userRoles.includes('Phục vụ');

  const waiterMenuItems = [
    {
      label: 'Bàn',
      href: '/quan-ly/table',
      icon: <Table className="h-5 w-5" />,
    },
    {
      label: 'Gọi món',
      href: '/quan-ly/order',
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      label: 'Lịch',
      href: '/schedule',
      icon: <CalendarDays className="h-5 w-5" />,
    },
    {
      label: 'Lương',
      href: '/payroll',
      icon: <ScrollText className="h-5 w-5" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex justify-around items-center md:hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center animate-pulse">
            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            <div className="w-10 h-3 bg-gray-200 rounded mt-1"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !isWaiter) {
    return null; // Không hiển thị nếu lỗi hoặc không phải role Phục vụ
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex justify-around items-center md:hidden z-50">
      {waiterMenuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {item.icon}
          <span className="text-xs mt-0.5">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}