'use client';

import { ClientWrapper } from '@/components/ClientWrapper/ClientWrapper';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { MobileSidebar } from '@/components/Sidebar/MobileSidebar';
// import { useEffect, useState } from 'react';
import { useEffect, useState, useRef } from 'react';
import { useGetUserMeQuery } from '@/features/auth/authApiSlice';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import useClearCache from '@/hooks/useClearCache';
import { Toaster } from 'sonner';

// Sử dụng dynamic import để tránh vấn đề SSR với sidebar
const DynamicSidebar = dynamic(() => import('@/components/Sidebar/Sidebar').then(mod => ({ default: mod.Sidebar })), {
  ssr: false,
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Ref để theo dõi nếu component đã mount
  const hasMounted = useRef(false);
  
  // Force refetch khi layout được tải
  const { refetch } = useGetUserMeQuery(undefined, {
    // Tránh gọi API khi ở server-side
    skip: typeof window === 'undefined'
  });
  
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  
  // Sử dụng hook xóa cache với tùy chọn KHÔNG xóa khi mount để tránh vấn đề hydration
  const { clearAllCache } = useClearCache({ clearOnMount: false });

  useEffect(() => {
    // Đánh dấu là đã chuyển sang client-side
    setIsClient(true);
    
    // Đánh dấu đã mount
    hasMounted.current = true;
    
    // Làm mới dữ liệu khi component mount, nhưng chỉ khi không ở trang login
    // Thêm timeout nhỏ để đảm bảo hydration đã hoàn thành
    const timer = setTimeout(() => {
      if (!pathname?.includes('/login')) {
        refetch().catch(error => {
          console.error('Lỗi khi tải dữ liệu người dùng:', error);
        });
      }
    }, 100);
    
    // Đăng ký event listener cho window beforeunload để xóa cache khi rời khỏi trang
    const handleBeforeUnload = () => {
      if (hasMounted.current) {
        clearAllCache();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(timer);
    };
  }, [refetch, pathname, clearAllCache]);
  
  // Thêm một placeholder trước khi client-side rendering
  // Placeholder này phải khớp với cấu trúc HTML cuối cùng để tránh hydration errors
  if (!isClient) {
    return (
      <div className="flex h-screen w-full">
        <div className="fixed top-0 left-0 w-64 h-screen border-r" aria-hidden="true"></div>
        <div className="flex-1 ml-64">
          <div className="min-h-screen">
            {/* Chỉ hiển thị một placeholder wrapper cho children */}
            <div aria-hidden="true"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Toaster position="top-right" closeButton richColors />
      <div className="flex flex-1">
        <div className="hidden md:block">
          <DynamicSidebar />
        </div>
        <ClientWrapper>{children}</ClientWrapper>
      </div>
      <MobileSidebar />
    </div>
  );
}