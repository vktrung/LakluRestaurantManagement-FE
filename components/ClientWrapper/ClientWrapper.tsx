'use client';

import { Header } from '@/components/Header/Header';
import { useSidebar } from '@/components/Sidebar/SidebarContext';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Sử dụng dynamic import cho Header
const DynamicHeader = dynamic(() => import('@/components/Header/Header').then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => <div className="h-16 border-b fixed top-0 right-0 left-16 z-30"></div>
});

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);

  // Client-side only effect
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Nếu chưa mounted thì render một layout cơ bản không có animation
  if (!isMounted) {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <div className="h-16 border-b fixed top-0 right-0 left-64 z-30" /> {/* Placeholder cho Header */}
        <main className="flex-1 p-6 ml-64 mt-16">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <DynamicHeader />
      <main
        className={`flex-1 transition-all duration-300 p-6 ${
          collapsed ? 'ml-16' : 'ml-64'
        } mt-16`}
      >
        {children}
      </main>
    </div>
  );
}