'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSidebar } from '../Sidebar/SidebarContext';
import { cn } from '@/lib/utils';
import { ChevronRight, Home, Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from './NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetUserMeQuery } from '@/features/auth/authApiSlice';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const pathMap: Record<string, string> = {
  'quan-ly': 'Quản lý',
  'tong-quat': 'Tổng quát',
  'giao-dich': 'Giao dịch',
  'mon-an': 'Món ăn',
  salary: 'Lương',
  menu: 'Menu',
  category: 'Danh mục',
  staff: 'Nhân viên',
  // 'salary': 'Mức Lương',
  order: 'Gọi món',
  role: 'Vai trò',
  permission: 'Quyền',
  'nha-hang': 'Nhà hàng',
  'may-pos': 'Máy POS',
  'chon-mon': 'Chọn món',
  table: 'Bàn Ăn',
  kitchen: 'Bếp',
  schedule: 'Lịch làm việc',
};

export function Header({ className }: { className?: string }) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  
  // Lấy refetch function từ hook để có thể làm mới dữ liệu user
  const { refetch: refetchUserMe } = useGetUserMeQuery();
  
  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (!pathname || pathname === '/') {
      return [{ label: 'Trang chủ', href: '/' }];
    }

    const segments = pathname.split('/').filter(Boolean);

    return [
      { label: 'Trang chủ', href: '/' },
      ...segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const label = pathMap[segment] || segment;
        return { label, href };
      }),
    ];
  };

  const breadcrumbs = generateBreadcrumbs();

  // Handle logout function
  const handleLogout = () => {
    // Delete auth_token cookie by setting its expiration date to the past
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Làm mới dữ liệu người dùng
    refetchUserMe();
    
    // Redirect to login page
    router.push('/login');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 bg-white dark:bg-slate-900 border-b dark:border-slate-800 h-16 z-30 transition-all duration-300',
        collapsed ? 'left-16' : 'left-64',
        className,
      )}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={item.href}>
                {index > 0 && (
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </li>
                )}
                <li>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center text-sm',
                      index === breadcrumbs.length - 1
                        ? 'font-semibold text-black dark:text-white'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
                    )}
                  >
                    {index === 0 && <Home className="h-4 w-4 mr-1" />}
                    <span>{item.label}</span>
                  </Link>
                </li>
              </React.Fragment>
            ))}
          </ol>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button> */}
          <div className="flex items-center space-x-2">
            {/* <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button> */}
            <NotificationBell />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
              <DropdownMenuItem>Cài đặt</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
