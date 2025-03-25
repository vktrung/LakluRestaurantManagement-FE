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

// Thêm import cho dropdown
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
  Menu,
  BarChart,
  FileText,
  Users,
  Settings as SettingsIcon,
  PieChart,
  DollarSign,
  Soup,
  Briefcase,
  BookOpen,
} from 'lucide-react';
import { IoFastFood } from 'react-icons/io5';

const mainAccordionItems = [
  {
    label: 'Quản lý',
    value: 'quan-ly',
    icon: <BarChart className="h-4 w-4" />,
    children: [
      {
        label: 'Tổng quát',
        href: '/quan-ly/tong-quat',
        icon: <PieChart className="h-4 w-4" />,
      },
      {
        label: 'Giao dịch',
        href: '/quan-ly/giao-dich',
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        label: 'Món ăn',
        href: '/quan-ly/mon-an',
        icon: <Soup className="h-4 w-4" />,
      },
      {
        label: 'Lương',
        href: '/quan-ly/luong',
        icon: <Briefcase className="h-4 w-4" />,
      },
      {
        label: 'Bàn ăn',
        href: '/quan-ly/table',
        icon: <PieChart className="h-4 w-4" />,
      },
      {
        label: 'Đặt bàn',
        href: '/quan-ly/reservation',
        icon: <PieChart className="h-4 w-4" />,
      },{
        label: 'Gọi món',
        href: '/quan-ly/order',
        icon: <PieChart className="h-4 w-4" />,
      },
    ],
  },
  {
    label: 'Menu',
    value: 'menu',
    icon: <FileText className="h-4 w-4" />,
    children: [
      {
        label: 'Danh mục',
        href: '/menu/category',
        icon: <BookOpen className="h-4 w-4" />,
      },
      {
        label: 'Thực đơn',
        href: '/menu/menu-info',
        icon: <IoFastFood className="h-4 w-4" />,
      },
      {
        label: 'Món ăn',
        href: '/menu/dish',
        icon: <IoFastFood className="h-4 w-4" />,
      },
      {
        label: 'Bàn ăn',
        href: '/table',
        icon: <PieChart className="h-4 w-4" />,
      },
    ],
  },
  {
    label: 'Nhân viên',
    value: 'staff',
    icon: <Users className="h-4 w-4" />,
    children: [
      {
        label: 'Danh sách',
        href: '/staff',
        icon: <Users className="h-4 w-4" />,
      },
      {
        label: 'Mức Lương',
        href: '/salary',
        icon: <Users className="h-4 w-4" />,
      },
      {
        label: 'Lịch làm việc',
        href: '/schedule',
        icon: <Users className="h-4 w-4" />,
      },
    ],
  },
  {
    label: 'Cài đặt',
    value: 'cai-dat',
    icon: <SettingsIcon className="h-4 w-4" />,
    children: [
      {
        label: 'Vai trò',
        href: '/role',
        icon: <Users className="h-4 w-4" />,
      },
      {
        label: 'Quyền',
        href: '/permission',
        icon: <SettingsIcon className="h-4 w-4" />,
      },
    ],
  },
];

const singleSection = {
  sectionLabel: 'Nhà hàng',
  links: [
    {
      label: 'Máy POS',
      href: '/nha-hang/may-pos',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: 'Chọn món',
      href: '/nha-hang/chon-mon',
      icon: <IoFastFood className="h-4 w-4" />,
    },
  ],
};

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 flex flex-col border-r dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 h-screen overflow-y-auto z-40',
        collapsed ? 'w-16' : 'w-64',
        className,
      )}
      {...props}
    >
      {/* Header */}
      <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between">
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

      {/* Accordion Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Accordion type="single" collapsible>
          {mainAccordionItems.map(item => (
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

        {/* Single Section: "Nhà hàng" */}
        <div className="mt-4">
          {!collapsed && (
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {singleSection.sectionLabel}
            </h3>
          )}
          {singleSection.links.map(link => (
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
      </nav>

      {/* Footer với dropdown */}
      <div className="p-4 border-t dark:border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <div className="text-sm">
            <div className="font-medium">shadcn</div>
            <div className="text-gray-500 dark:text-gray-400">
              m@example.com
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
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing">Billing</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/keyboard-shortcuts">Keyboard shortcuts</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Invite users</DropdownMenuItem>
              <DropdownMenuItem>New Team</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="https://github.com">GitHub</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuItem>API</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
