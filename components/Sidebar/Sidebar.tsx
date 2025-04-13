// File: components/Sidebar/Sidebar.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarContext';

// shadcn-ui
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

// Dropdown imports
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

// lucide-react icons
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
  Menu
} from "lucide-react"

import { IoFastFood } from 'react-icons/io5';
import { useGetUserMeQuery } from '@/features/auth/authApiSlice';

// Define menu items for each role
const roleBasedMenuItems = {
  "Quản trị viên hệ thống": [
    // Admin has access to all menu items
    {
      label: "Quản lý",
      value: "quan-ly",
      icon: <LayoutDashboard className="h-4 w-4" />, // Thay đổi từ BarChart
      children: [
        {
          label: "Tổng quát",
          href: "/quan-ly/tong-quat",
          icon: <LayoutDashboard className="h-4 w-4" />, // Dashboard icon phù hợp hơn
        },
        {
          label: "Bàn ăn",
          href: "/quan-ly/table",
          icon: <Table className="h-4 w-4" />, // Icon bàn phù hợp hơn
        },
        {
          label: "Đặt bàn",
          href: "/quan-ly/reservation",
          icon: <CalendarClock className="h-4 w-4" />, // Icon lịch đặt trước
        },
        {
          label: "Gọi món",
          href: "/quan-ly/order",
          icon: <ShoppingCart className="h-4 w-4" />, // Icon giỏ hàng phù hợp hơn
        },
        {
          label: "Mã giảm giá",
          href: "/voucher",
          icon: <Tag className="h-4 w-4" />, // Icon thẻ giảm giá
        },
      ],
    },
    {
      label: "Menu",
      value: "menu",
      icon: <UtensilsCrossed className="h-4 w-4" />, // Thay đổi từ FileText
      children: [
        {
          label: "Danh mục",
          href: "/menu/category",
          icon: <ListOrdered className="h-4 w-4" />, // Icon danh sách có thứ tự
        },
        {
          label: "Thực đơn",
          href: "/menu/menu-info",
          icon: <UtensilsCrossed className="h-4 w-4" />, // Icon dao và nĩa
        },
        {
          label: "Món ăn",
          href: "/menu/dish",
          icon: <Coffee className="h-4 w-4" />, // Icon món ăn
        },
      ],
    },
    {
      label: "Nhân viên",
      value: "staff",
      icon: <Users className="h-4 w-4" />, // Giữ nguyên
      children: [
        {
          label: "Danh sách",
          href: "/staff",
          icon: <Users className="h-4 w-4" />, // Giữ nguyên
        },
        {
          label: "Mức Lương",
          href: "/salary",
          icon: <BadgePercent className="h-4 w-4" />, // Icon phần trăm phù hợp hơn
        },
        {
          label: "Bảng Lương",
          href: "/payroll",
          icon: <ScrollText className="h-4 w-4" />, // Icon bảng lương
        },
        {
          label: "Lịch làm việc",
          href: "/schedule",
          icon: <CalendarDays className="h-4 w-4" />, // Giữ nguyên
        },
      ],
    },
    {
      label: "Cài đặt",
      value: "cai-dat",
      icon: <SettingsIcon className="h-4 w-4" />, // Giữ nguyên
      children: [
        {
          label: "Vai trò",
          href: "/role",
          icon: <UserCog className="h-4 w-4" />, // Icon người dùng với bánh răng
        },
        {
          label: "Quyền",
          href: "/permission",
          icon: <Shield className="h-4 w-4" />, // Icon khiên bảo vệ
        },
        {
          label: "Lịch sử hoạt động",
          href: "/activitylog",
          icon: <History className="h-4 w-4" />, // Icon lịch sử
        },
      ],
    },
  ],
  "Phục vụ": [
    {
      label: "Phục vụ",
      value: "phuc-vu",
      icon: <Utensils className="h-4 w-4" />, // Thay đổi từ Users
      children: [
        {
          label: "Bàn ăn",
          href: "/quan-ly/table",
          icon: <Table className="h-4 w-4" />, // Icon bàn
        },
        {
          label: "Gọi món",
          href: "/quan-ly/order",
          icon: <ShoppingCart className="h-4 w-4" />, // Icon giỏ hàng
        },
        {
          label: "Lịch làm việc",
          href: "/schedule",
          icon: <CalendarDays className="h-4 w-4" />, // Giữ nguyên
        },
      ],
    },
  ],
  Bếp: [
    {
      label: "Bếp",
      value: "bep",
      icon: <ChefHat className="h-4 w-4" />, // Thay đổi từ IoFastFood
      children: [
        {
          label: "Bếp",
          href: "/kitchen",
          icon: <ChefHat className="h-4 w-4" />, // Icon đầu bếp
        },
        {
          label: "Lịch làm việc",
          href: "/schedule",
          icon: <CalendarDays className="h-4 w-4" />, // Giữ nguyên
        },
      ],
    },
  ],
  "Thu ngân": [
    {
      label: "Thu ngân",
      value: "thu-ngan",
      icon: <DollarSign className="h-4 w-4" />, // Giữ nguyên
      children: [
        {
          label: "Máy POS",
          href: "/cashier-order",
          icon: <CreditCard className="h-4 w-4" />, // Icon thẻ tín dụng
        },
        {
          label: "Lịch làm việc",
          href: "/schedule",
          icon: <CalendarDays className="h-4 w-4" />, // Giữ nguyên
        },
      ],
    },
  ],
}


// Define quick links for roles
const roleBasedQuickLinks = {
  "Quản trị viên hệ thống": [
    {
      label: "Máy POS",
      href: "/cashier-order",
      icon: <CreditCard className="h-4 w-4" />, // Thay đổi từ FileText
    },
    {
      label: "Bếp",
      href: "/kitchen",
      icon: <ChefHat className="h-4 w-4" />, // Thay đổi từ IoFastFood
    },
    {
      label: "Máy POS 2",
      href: "/cashier-order-2/order",
      icon: <Receipt className="h-4 w-4" />, // Thay đổi từ FileText
    },
  ],
  "Phục vụ": [
    {
      label: "Bàn ăn",
      href: "/table",
      icon: <Table className="h-4 w-4" />, // Thay đổi từ PieChart
    },
    {
      label: "Gọi món",
      href: "/quan-ly/order",
      icon: <ShoppingCart className="h-4 w-4" />, // Thay đổi từ IoFastFood
    },
  ],
  Bếp: [
    {
      label: "Bếp",
      href: "/kitchen",
      icon: <ChefHat className="h-4 w-4" />, // Thay đổi từ IoFastFood
    },
  ],
  "Thu ngân": [
    {
      label: "Máy POS",
      href: "/cashier-order",
      icon: <CreditCard className="h-4 w-4" />, // Thay đổi từ FileText
    },
  ],
}


interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const { collapsed, toggleCollapsed } = useSidebar();
  const { data, isLoading, error, refetch } = useGetUserMeQuery(undefined, {
    // Luôn làm mới khi component được mount
    refetchOnMountOrArgChange: true
  });
  
  // Force refetch khi component được mount
  React.useEffect(() => {
    refetch();
  }, [refetch]);
  
  // Determine which menu items to show based on user role
  const userRoles = data?.data?.roleNames || [];
  
  // Reset menu items khi dữ liệu đang tải hoặc có lỗi
  const menuItems = React.useMemo(() => {
    // Nếu đang tải hoặc có lỗi, hiển thị menu trống
    if (isLoading || error) {
      return [];
    }
    
    if (userRoles.includes('Quản trị viên hệ thống')) {
      return roleBasedMenuItems['Quản trị viên hệ thống'];
    } else if (userRoles.includes('Phục vụ')) {
      return roleBasedMenuItems['Phục vụ'];
    } else if (userRoles.includes('Bếp')) {
      return roleBasedMenuItems['Bếp'];
    } else if (userRoles.includes('Thu ngân')) {
      return roleBasedMenuItems['Thu ngân'];
    }
    return [];
  }, [userRoles, isLoading, error]);

  // Determine which quick links to show
  const quickLinks = React.useMemo(() => {
    // Nếu đang tải hoặc có lỗi, hiển thị menu trống
    if (isLoading || error) {
      return [];
    }
    
    if (userRoles.includes('Quản trị viên hệ thống')) {
      return roleBasedQuickLinks['Quản trị viên hệ thống'];
    } else if (userRoles.includes('Phục vụ')) {
      return roleBasedQuickLinks['Phục vụ'];
    } else if (userRoles.includes('Bếp')) {
      return roleBasedQuickLinks['Bếp'];
    } else if (userRoles.includes('Thu ngân')) {
      return roleBasedQuickLinks['Thu ngân'];
    }
    return [];
  }, [userRoles, isLoading, error]);

  return (
    <div className={cn(
      'fixed top-0 left-0 flex flex-col border-r dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 h-screen overflow-y-auto z-40',
      collapsed ? 'w-16' : 'w-64',
      className,
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

        {/* Content area - with flex-grow to push footer down */}
        <div className="flex flex-col flex-grow overflow-hidden">
          {/* Nếu đang loading thì hiển thị skeleton */}
          {isLoading ? (
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
            /* Accordion Menu */
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <Accordion type="single" collapsible>
                {menuItems.map(item => (
                  <AccordionItem value={item.value} key={item.value}>
                    <AccordionTrigger className="flex items-center gap-2">
                      {item.icon}
                      {!collapsed && <span>{item.label}</span>}
                    </AccordionTrigger>

                    <AccordionContent className={!collapsed ? 'pl-6' : ''}>
                      {item.children.map(child => (
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
                  {quickLinks.map(link => (
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

        {/* Footer with dropdown - always at bottom */}
        <div className="p-4 border-t dark:border-slate-800 flex items-center justify-between mt-auto flex-shrink-0">
          {!collapsed && data?.data && (
            <div className="text-sm">
              <div className="font-medium">{data.data.username}</div>
              <div className="text-gray-500 dark:text-gray-400">
                {data.data.email}
              </div>
            </div>
          )}

          {/* Dropdown Menu */}
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
                <DropdownMenuItem asChild>
                  <Link href="/settings">Cài đặt</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                // Xóa token
                document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                // Làm mới dữ liệu
                refetch();
                // Chuyển hướng
                window.location.href = '/login';
              }}>
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </div>
  );
}