'use client';

import { ClientWrapper } from '@/components/ClientWrapper/ClientWrapper';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { MobileSidebar } from '@/components/Sidebar/MobileSidebar';
import { useEffect, useState } from 'react';
import { useGetUserMeQuery } from '@/features/auth/authApiSlice';
import dynamic from 'next/dynamic';

// Sử dụng dynamic import để tránh vấn đề SSR với sidebar
const DynamicSidebar = dynamic(() => import('@/components/Sidebar/Sidebar').then(mod => ({ default: mod.Sidebar })), {
  ssr: false,
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { refetch } = useGetUserMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    refetch();
    setIsClient(true);
  }, [refetch]);

  if (!isClient) {
    return (
      <div className="flex min-h-screen">
        <div className="fixed top-0 left-0 w-64 h-screen border-r hidden md:block"></div>
        <ClientWrapper>{children}</ClientWrapper>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
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