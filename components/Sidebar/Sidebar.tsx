'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarContext';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  SettingsIcon,
  DollarSign,
  Utensils,
  CalendarDays,
  Table,
  CalendarClock,
  ShoppingCart,
  Tag,
  ListOrdered,
  ChefHat,
  History,
  Shield,
  UserCog,
  CreditCard,
  BadgePercent,
  ScrollText,
  Coffee,
  UtensilsCrossed,
  Receipt,
  Menu,
  Banknote,
} from 'lucide-react';
import { IoFastFood } from 'react-icons/io5';
import { useGetUserMeQuery } from '@/features/auth/authApiSlice';
import { useGetShiftsByStaffAndDateRangeQuery } from '@/features/schedule/scheduleApiSlice';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Define types for menu items and quick links
interface MenuItemChild {
  label: string;
  href: string;
  icon: React.ReactElement;
}

interface MenuItem {
  label: string;
  value: string;
  icon: React.ReactElement;
  children: MenuItemChild[];
}

interface QuickLink {
  label: string;
  href: string;
  icon: React.ReactElement;
}

// Define the structure of roleBasedMenuItems
interface RoleBasedMenuItems {
  'Quản trị viên hệ thống': MenuItem[];
  'Phục vụ': MenuItem[];
  Bếp: MenuItem[];
  'Thu ngân': MenuItem[];
}

// Define the structure of roleBasedQuickLinks
interface RoleBasedQuickLinks {
  'Quản trị viên hệ thống': QuickLink[];
  'Phục vụ': QuickLink[];
  Bếp: QuickLink[];
  'Thu ngân': QuickLink[];
}

// Define Shift interface based on API response
interface Shift {
  id: number;
  timeIn: string; // e.g., "2025-04-27T18:00:00"
  timeOut: string; // e.g., "2025-04-28T01:00:35"
  detail: {
    id: number;
    managerFullName: string;
    numberOfStaff: number;
    userFullNames: string[];
    note: string;
    timeIn: string;
    timeOut: string;
    attended: string;
    userAttendancesByFullName: Record<string, boolean>;
  };
}

// Role-based menu items with explicit type
const roleBasedMenuItems: RoleBasedMenuItems = {
  'Quản trị viên hệ thống': [
    {
      label: 'Quản lý',
      value: 'quan-ly',
      icon: <LayoutDashboard className="h-4 w-4" />,
      children: [
        { label: 'Tổng quát', href: '/quan-ly/tong-quat', icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: 'Bàn ăn', href: '/quan-ly/table', icon: <Table className="h-4 w-4" /> },
        { label: 'Đặt bàn', href: '/quan-ly/reservation', icon: <CalendarClock className="h-4 w-4" /> },
        { label: 'Gọi món', href: '/quan-ly/order', icon: <ShoppingCart className="h-4 w-4" /> },
        { label: 'Mã giảm giá', href: '/voucher', icon: <Tag className="h-4 w-4" /> },
        { label: 'Giao dịch', href: '/payment', icon: <Banknote className="h-4 w-4" /> },
      ],
    },
    {
      label: 'Menu',
      value: 'menu',
      icon: <UtensilsCrossed className="h-4 w-4" />,
      children: [
        { label: 'Danh mục', href: '/menu/category', icon: <ListOrdered className="h-4 w-4" /> },
        { label: 'Thực đơn', href: '/menu/menu-info', icon: <UtensilsCrossed className="h-4 w-4" /> },
        { label: 'Món ăn', href: '/menu/dish', icon: <Coffee className="h-4 w-4" /> },
      ],
    },
    {
      label: 'Nhân viên',
      value: 'staff',
      icon: <Users className="h-4 w-4" />,
      children: [
        { label: 'Danh sách', href: '/staff', icon: <Users className="h-4 w-4" /> },
        { label: 'Mức Lương', href: '/salary', icon: <BadgePercent className="h-4 w-4" /> },
        { label: 'Bảng Lương', href: '/payroll', icon: <ScrollText className="h-4 w-4" /> },
        { label: 'Lịch làm việc', href: '/schedule', icon: <CalendarDays className="h-4 w-4" /> },
      ],
    },
    {
      label: 'Cài đặt',
      value: 'cai-dat',
      icon: <SettingsIcon className="h-4 w-4" />,
      children: [
        { label: 'Vai trò', href: '/role', icon: <UserCog className="h-4 w-4" /> },
        { label: 'Quyền', href: '/permission', icon: <Shield className="h-4 w-4" /> },
        { label: 'Lịch sử hoạt động', href: '/activitylog', icon: <History className="h-4 w-4" /> },
      ],
    },
  ],
  'Phục vụ': [
    {
      label: 'Phục vụ',
      value: 'phuc-vu',
      icon: <Utensils className="h-4 w-4" />,
      children: [
        { label: 'Bàn ăn', href: '/quan-ly/table', icon: <Table className="h-4 w-4" /> },
        { label: 'Gọi món', href: '/quan-ly/order', icon: <ShoppingCart className="h-4 w-4" /> },
        { label: 'Lịch làm việc', href: '/schedule', icon: <CalendarDays className="h-4 w-4" /> },
        { label: 'Bảng Lương', href: '/payroll', icon: <ScrollText className="h-4 w-4" /> },
      ],
    },
  ],
  Bếp: [
    {
      label: 'Bếp',
      value: 'bep',
      icon: <ChefHat className="h-4 w-4" />,
      children: [
        { label: 'Bếp', href: '/kitchen', icon: <ChefHat className="h-4 w-4" /> },
        { label: 'Lịch làm việc', href: '/schedule', icon: <CalendarDays className="h-4 w-4" /> },
        { label: 'Bảng Lương', href: '/payroll', icon: <ScrollText className="h-4 w-4" /> },
      ],
    },
  ],
  'Thu ngân': [
    {
      label: 'Thu ngân',
      value: 'thu-ngan',
      icon: <DollarSign className="h-4 w-4" />,
      children: [
        { label: 'Giao dịch', href: '/payment', icon: <Banknote className="h-4 w-4" /> },
        { label: 'Lịch làm việc', href: '/schedule', icon: <CalendarDays className="h-4 w-4" /> },
        { label: 'Bảng Lương', href: '/payroll', icon: <ScrollText className="h-4 w-4" /> },
      ],
    },
  ],
};

// Role-based quick links with explicit type
const roleBasedQuickLinks: RoleBasedQuickLinks = {
  'Quản trị viên hệ thống': [
    { label: 'Két', href: '/cash-register', icon: <CreditCard className="h-4 w-4" /> },
    { label: 'Bếp', href: '/kitchen', icon: <ChefHat className="h-4 w-4" /> },
    { label: 'Máy POS', href: '/cashier-order-2/order', icon: <Receipt className="h-4 w-4" /> },
  ],
  'Phục vụ': [
    { label: 'Bàn ăn', href: '/table', icon: <Table className="h-4 w-4" /> },
    { label: 'Gọi món', href: '/quan-ly/order', icon: <ShoppingCart className="h-4 w-4" /> },
  ],
  Bếp: [
    { label: 'Bếp', href: '/kitchen', icon: <ChefHat className="h-4 w-4" /> },
  ],
  'Thu ngân': [
    { label: 'Két', href: '/cash-register', icon: <CreditCard className="h-4 w-4" /> },
    { label: 'Máy POS', href: '/cashier-order-2/order', icon: <CreditCard className="h-4 w-4" /> },
  ],
};

// Utility function to format date as DD/MM/YYYY
const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const { collapsed, toggleCollapsed } = useSidebar();
  const { data: userData, isLoading: isUserLoading, error: userError, refetch } = useGetUserMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Get current date in DD/MM/YYYY format (e.g., 28/04/2025)
  const currentDate = formatDateToDDMMYYYY(new Date());

  // Get staffId from userData (use provided staffId 2 for testing)
  const staffId = userData?.data?.id || 2;

  // Fetch shifts for the staffId for the current date
  const { data: shiftData, isLoading: isShiftLoading, error: shiftError } = useGetShiftsByStaffAndDateRangeQuery(
    {
      staffId: staffId,
      startDate: currentDate, // e.g., "28/04/2025"
      endDate: currentDate,
    },
    { skip: !staffId } // Skip query if staffId is not available
  );

  const isLoginPage = typeof window !== 'undefined' && window.location.pathname.includes('/login');

  React.useEffect(() => {
    if (!isLoginPage) {
      refetch();
    }
  }, [refetch, isLoginPage]);

  const userRoles = userData?.data?.roleNames || [];

  // Kiểm tra đơn giản: nếu có dữ liệu ca làm việc và không trống
  const hasShifts = React.useMemo(() => {
    if (isShiftLoading || shiftError || !shiftData?.data) {
      const errorMessage = shiftError
        ? 'FetchBaseQueryError' in shiftError
          ? (shiftError as FetchBaseQueryError).status
          : (shiftError as { message?: string }).message || 'Unknown error'
        : 'No error';
      console.log('Shift check skipped:', {
        isShiftLoading,
        shiftError: errorMessage,
        hasShiftData: !!shiftData?.data,
      });
      return false;
    }

    // Kiểm tra nếu có bất kỳ ca làm việc nào
    const hasAnyShift = shiftData.data.length > 0;

    console.log('Shift check result:', {
      hasAnyShift,
      shiftsCount: shiftData.data.length,
      userRoles,
      currentDate,
      shiftData: shiftData.data,
    });
    
    return hasAnyShift;
  }, [shiftData, isShiftLoading, shiftError, userRoles, currentDate]);

  // Filter menu items based on shift existence for Phục vụ, Bếp, and Thu ngân
  const menuItems = React.useMemo((): MenuItem[] => {
    if (isUserLoading || userError) {
      // console.log('Menu items skipped:', { isUserLoading, userError: userError?.message });
      return [];
    }

    let items: MenuItem[] = [];
    if (userRoles.includes('Quản trị viên hệ thống')) {
      items = roleBasedMenuItems['Quản trị viên hệ thống'];
    } else if (userRoles.includes('Phục vụ') || userRoles.includes('Bếp') || userRoles.includes('Thu ngân')) {
      const role = userRoles.includes('Phục vụ') ? 'Phục vụ' : userRoles.includes('Bếp') ? 'Bếp' : 'Thu ngân';
      items = roleBasedMenuItems[role];
      if (!hasShifts) {
        // Filter to only show "Bảng Lương" and "Lịch làm việc" if no shift
        items = items.map((item) => ({
          ...item,
          children: item.children.filter(
            (child) => child.href === '/payroll' || child.href === '/schedule'
          ),
        })).filter((item) => item.children.length > 0); // Remove items with empty children
      }
    }
    console.log('Computed menuItems:', { items, role: userRoles, hasShifts });
    return items;
  }, [userRoles, isUserLoading, userError, hasShifts]);

  // Filter quick links based on shift existence for Phục vụ, Bếp, and Thu ngân
  const quickLinks = React.useMemo((): QuickLink[] => {
    if (isUserLoading || userError) return [];

    let links: QuickLink[] = [];
    if (userRoles.includes('Quản trị viên hệ thống')) {
      links = roleBasedQuickLinks['Quản trị viên hệ thống'];
    } else if (userRoles.includes('Phục vụ') || userRoles.includes('Bếp') || userRoles.includes('Thu ngân')) {
      const role = userRoles.includes('Phục vụ') ? 'Phục vụ' : userRoles.includes('Bếp') ? 'Bếp' : 'Thu ngân';
      if (hasShifts) {
        links = roleBasedQuickLinks[role];
      } else {
        links = [];
      }
    }
    console.log('Computed quickLinks:', { links, role: userRoles, hasShifts });
    return links;
  }, [userRoles, isUserLoading, userError, hasShifts]);

  return (
    <div
      className={cn(
        'fixed top-0 left-0 flex flex-col border-r dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 h-screen overflow-y-auto z-40',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
      {...props}
    >
      <aside className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold">Laklu</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nhà hàng</p>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={toggleCollapsed}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Content area */}
        <div className="flex flex-col flex-grow overflow-hidden">
          {(isUserLoading || isShiftLoading) ? (
            <div className="p-4 flex-shrink-0">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 w-4/5"></div>
              </div>
            </div>
          ) : (
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <Accordion type="single" collapsible>
                {menuItems.map((item) => (
                  <AccordionItem value={item.value} key={item.value}>
                    <AccordionTrigger className="flex items-center gap-2">
                      {item.icon}
                      {!collapsed && <span>{item.label}</span>}
                    </AccordionTrigger>
                    <AccordionContent className={!collapsed ? 'pl-6' : ''}>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center gap-2 py-1 text-sm hover:underline"
                        >
                          {child.icon}
                          {!collapsed && <span>{child.label}</span>}
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Quick Links Section */}
              {quickLinks.length > 0 && (
                <div className="mt-4">
                  {!collapsed && (
                    <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Truy cập nhanh
                    </h3>
                  )}
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 py-1 text-sm hover:underline"
                    >
                      {link.icon}
                      {!collapsed && <span>{link.label}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </nav>
          )}
        </div>

        {/* Footer with dropdown */}
        <div className="p-4 border-t dark:border-slate-800 flex items-center justify-between mt-auto flex-shrink-0">
          {!collapsed && userData?.data && (
            <div className="text-sm">
              <div className="font-medium">{userData.data.username}</div>
              <div className="text-gray-500 dark:text-gray-400">{userData.data.email}</div>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Hồ sơ</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                  refetch();
                  window.location.href = '/login';
                }}
              >
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </div>
  );
}