'use client';

import { Header } from '@/components/Header/Header';
import { useSidebar } from '@/components/Sidebar/SidebarContext';
import React from 'react';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Header />
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