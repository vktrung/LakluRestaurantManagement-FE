'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

// Sử dụng dynamic import cho Header
const DynamicHeader = dynamic(() => import('@/components/Header/Header').then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => <div className="h-16 border-b fixed top-0 right-0 left-64 z-30 bg-white dark:bg-slate-900"></div>,
});

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <div className="h-16 border-b fixed top-0 right-0 left-64 z-30 bg-white dark:bg-slate-900" />
        <main className="flex-1 p-4 ml-64 mt-16">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <div className="hidden md:block">
        <DynamicHeader />
      </div>
      <main
        className={cn(
          'flex-1 p-4 md:ml-64 md:mt-16 pb-16 md:pb-4', // pb-16 trên mobile để tránh bottom nav
        )}
      >
        {children}
      </main>
    </div>
  );
}