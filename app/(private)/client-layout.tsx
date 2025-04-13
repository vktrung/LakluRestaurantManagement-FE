'use client';

import { ClientWrapper } from '@/components/ClientWrapper/ClientWrapper';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { useEffect, useState } from 'react';
import { useGetUserMeQuery } from '@/features/auth/authApiSlice';
import dynamic from 'next/dynamic';

// Sử dụng dynamic import để tránh vấn đề SSR với sidebar
const DynamicSidebar = dynamic(() => import('@/components/Sidebar/Sidebar').then(mod => ({ default: mod.Sidebar })), {
  ssr: false,
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Force refetch khi layout được tải
  const { refetch } = useGetUserMeQuery();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Làm mới dữ liệu khi component mount
    refetch();
    setIsClient(true);
  }, [refetch]);
  
  // Chờ đến khi client-side rendering để tránh lỗi hydration
  if (!isClient) {
    return (
      <div className="flex">
        <div className="fixed top-0 left-0 w-64 h-screen border-r"></div>
        <ClientWrapper>{children}</ClientWrapper>
      </div>
    );
  }
  
  return (
    <div className="flex">
      <DynamicSidebar />
      <ClientWrapper>{children}</ClientWrapper>
    </div>
  );
} 