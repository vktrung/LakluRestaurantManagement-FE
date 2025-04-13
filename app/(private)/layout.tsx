// File: app/(private)/layout.tsx
import { SidebarProvider } from '@/components/Sidebar/SidebarContext';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

// Tránh lỗi bằng cách dùng React.lazy và dynamic import
const ClientLayout = dynamic(() => import('@/app/(private)/client-layout'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'Laklu Res',
  description: 'Hệ thống quản lý nhà hàng Laklu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <ClientLayout>{children}</ClientLayout>
        </SidebarProvider>
      </body>
    </html>
  );
}