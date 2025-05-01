
'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useGetUserMeQuery } from '@/features/auth/authApiSlice';
import { useGetShiftsByStaffAndDateRangeQuery } from '@/features/schedule/scheduleApiSlice';
import { useGetMyProfileQuery } from '@/features/profile/profileApiSlice';
import { Table, ShoppingCart, CalendarDays, ScrollText, User, LogOut, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '../Header/NotificationBell';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Define Shift interface based on API response
interface Shift {
  id: number;
  timeIn: string; // e.g., "2025-05-01T16:00:00"
  timeOut: string; // e.g., "2025-05-02T01:00:00"
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

// Menu item interface
interface MenuItem {
  label?: string; // Optional for NotificationBell
  href?: string;
  icon: React.ReactElement;
  dropdown?: boolean;
}

// Utility function to format date as DD/MM/YYYY
const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export function MobileSidebar() {
  const router = useRouter();
  const { data: userData, isLoading: isUserLoading, error: userError, refetch } = useGetUserMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: profile, isLoading: isProfileLoading } = useGetMyProfileQuery();

  // Get current date in DD/MM/YYYY format (e.g., 01/05/2025)
  const currentDate = formatDateToDDMMYYYY(new Date());

  // Get staffId from userData (use provided staffId 2 for testing)
  const staffId = userData?.data?.id || 2;

  // Fetch shifts for the staffId for the current date
  const { data: shiftData, isLoading: isShiftLoading, error: shiftError } = useGetShiftsByStaffAndDateRangeQuery(
    {
      staffId: staffId,
      startDate: currentDate, // e.g., "01/05/2025"
      endDate: currentDate,
    },
    { skip: !staffId } // Skip query if staffId is not available
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  const userRoles = userData?.data?.roleNames || [];
  const userFullName = profile?.fullName || '';
  const isWaiter = userRoles.includes('Phục vụ');

  // Check if user has shifts today
  const hasShifts = useMemo(() => {
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

  // Check if user has attended their shift
  const hasAttendedShift = useMemo(() => {
    if (isShiftLoading || shiftError || !shiftData?.data || shiftData.data.length === 0) {
      console.log('Attendance check skipped:', {
        isShiftLoading,
        shiftError: shiftError
          ? 'FetchBaseQueryError' in shiftError
            ? (shiftError as FetchBaseQueryError).status
            : (shiftError as { message?: string }).message || 'Unknown error'
          : 'No error',
        hasShiftData: !!shiftData?.data,
      });
      return false;
    }

    if (!userFullName) {
      console.log('Cannot check attendance: user full name is missing');
      return false;
    }

    for (const shift of shiftData.data) {
      if (shift.detail && shift.detail.userAttendancesByFullName) {
        if (shift.detail.userAttendancesByFullName[userFullName] === true) {
          console.log(`User ${userFullName} has attended their shift`);
          return true;
        }
      }
    }

    console.log(`User ${userFullName} has not attended any shifts today`);
    return false;
  }, [shiftData, isShiftLoading, shiftError, userFullName]);

  // Check if current time is within any shift's timeIn and timeOut
  const isWithinShiftHours = useMemo(() => {
    if (isShiftLoading || shiftError || !shiftData?.data || shiftData.data.length === 0) {
      console.log('Shift hours check skipped:', {
        isShiftLoading,
        shiftError: shiftError
          ? 'FetchBaseQueryError' in shiftError
            ? (shiftError as FetchBaseQueryError).status
            : (shiftError as { message?: string }).message || 'Unknown error'
          : 'No error',
        hasShiftData: !!shiftData?.data,
      });
      return false;
    }

    const now = new Date();

    for (const shift of shiftData.data) {
      const timeIn = new Date(shift.timeIn);
      const timeOut = new Date(shift.timeOut);

      if (now >= timeIn && now <= timeOut) {
        console.log('Current time is within shift hours:', {
          shiftId: shift.id,
          timeIn: shift.timeIn,
          timeOut: shift.timeOut,
          currentTime: now.toISOString(),
        });
        return true;
      }
    }

    console.log('Current time is outside shift hours:', {
      currentTime: now.toISOString(),
      shifts: shiftData.data.map((s: Shift) => ({
        id: s.id,
        timeIn: s.timeIn,
        timeOut: s.timeOut,
      })),
    });
    return false;
  }, [shiftData, isShiftLoading, shiftError]);

  // Filter menu items based on shift existence, attendance, and shift hours
  const filteredMenuItems = useMemo(() => {
    if (!isWaiter) return [];

    const baseMenuItems: MenuItem[] = [
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
      {
        icon: <NotificationBell isMobile />,
      },
      {
        label: 'Tài khoản',
        icon: <User className="h-5 w-5" />,
        dropdown: true,
      },
    ];

    // Show limited menu if no shifts, not attended, or outside shift hours
    if (!hasShifts || !hasAttendedShift || !isWithinShiftHours) {
      return baseMenuItems.filter(
        (item) => item.href === '/schedule' || item.href === '/payroll' || !item.href
      );
    }

    // Show full menu if has shifts, attended, and within shift hours
    return baseMenuItems;
  }, [isWaiter, hasShifts, hasAttendedShift, isWithinShiftHours]);

  const handleLogout = () => {
    deleteCookie('auth_token');
    router.push('/login');
    router.refresh();
  };

  if (isUserLoading || isShiftLoading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex justify-around items-center md:hidden z-50">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col items-center animate-pulse">
            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            <div className="w-10 h-3 bg-gray-200 rounded mt-1"></div>
          </div>
        ))}
      </div>
    );
  }

  if (userError || !isWaiter) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex justify-around items-center md:hidden z-50">
      {/* Notification for missing attendance or outside shift hours */}
      {hasShifts && (
        <>
          {!hasAttendedShift && (
            <div className="absolute top-[-60px] left-0 right-0 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm text-center">
              <p>Bạn cần điểm danh để truy cập đầy đủ chức năng</p>
            </div>
          )}
          {hasAttendedShift && !isWithinShiftHours && (
            <div className="absolute top-[-60px] left-0 right-0 p-3 bg-blue-50 border border-blue-300 text-blue-800 text-sm text-center">
              <p>Hiện chưa đến giờ ca làm việc của bạn</p>
            </div>
          )}
        </>
      )}

      {filteredMenuItems.map((item, index) =>
        item.dropdown ? (
          <div key={`dropdown-${index}`} className="flex flex-col items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none">
                {item.icon}
                <span className="text-xs mt-0.5">{item.label}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Hồ sơ</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : !item.href ? (
          <div
            key={`notification-${index}`}
            className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {item.icon}
          </div>
        ) : (
          <Link
            key={`link-${index}`}
            href={item.href}
            className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {item.icon}
            <span className="text-xs mt-0.5">{item.label}</span>
          </Link>
        )
      )}
    </div>
  );
}
