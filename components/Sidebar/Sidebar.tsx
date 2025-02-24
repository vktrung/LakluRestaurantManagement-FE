'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// shadcn-ui
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

// lucide-react icons (ví dụ)
import {
  Menu,
  BarChart,
  FileText,
  Users,
  Settings,
  PieChart,
  DollarSign,
  Soup,
  Briefcase,
  BookOpen,
} from 'lucide-react';
import { IoFastFood } from 'react-icons/io5';

// Dữ liệu accordion (cha + con), có icon cho cả con
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
        label: 'Món ăn',
        href: '/menu/mon-an',
        icon: <IoFastFood className="h-4 w-4" />,
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
      // ...
    ],
  },
  {
    label: 'Cài đặt',
    value: 'cai-dat',
    icon: <Settings className="h-4 w-4" />,
    children: [
      {
        label: 'Vai trò',
        href: '/cai-dat/vai-tro',
        icon: <Users className="h-4 w-4" />,
      },
      {
        label: 'Quyền',
        href: '/cai-dat/quyen',
        icon: <Settings className="h-4 w-4" />,
      },
    ],
  },
];

// Mục “Nhà hàng” (không accordion) cũng có icon
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
  // State đóng/mở toàn sidebar
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col border-r dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 h-screen',
        collapsed ? 'w-16' : 'w-64',
        className,
      )}
      {...props}
    >
      {/* Header: logo, nút toggle */}
      <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-bold">Laklu</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nhà hàng</p>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Accordion Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <Accordion type="single" collapsible>
          {mainAccordionItems.map(item => (
            <AccordionItem value={item.value} key={item.value}>
              {/* AccordionTrigger */}
              <AccordionTrigger className="flex items-center gap-2">
                {/* Icon cha hiển thị luôn */}
                {item.icon}
                {/* Thu nhỏ => ẩn text cha */}
                {!collapsed && <span>{item.label}</span>}
              </AccordionTrigger>

              <AccordionContent className={!collapsed ? 'pl-6' : ''}>
                {/* Sub items */}
                {item.children.map(child => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="flex items-center gap-2 py-1 text-sm hover:underline"
                  >
                    {/* Icon con */}
                    {child.icon}
                    {/* Thu nhỏ => ẩn text con */}
                    {!collapsed && <span>{child.label}</span>}
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Single Section: “Nhà hàng” */}
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
              {/* Thu nhỏ => ẩn text */}
              {!collapsed && <span>{link.label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer user info */}
      <div className="p-4 border-t dark:border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <div className="text-sm">
            <div className="font-medium">shadcn</div>
            <div className="text-gray-500 dark:text-gray-400">
              m@example.com
            </div>
          </div>
        )}
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
