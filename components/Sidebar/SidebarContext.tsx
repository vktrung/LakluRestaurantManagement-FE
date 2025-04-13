'use client';

import React, { createContext, useContext, useState } from 'react';

type SidebarContextType = {
  collapsed: boolean;
  toggleCollapsed: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Kiểm tra trạng thái từ localStorage nếu ở client-side
function getInitialCollapsedState(): boolean {
  if (typeof window === 'undefined') {
    return false; // Mặc định khi ở server
  }
  
  try {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  } catch (e) {
    return false;
  }
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(() => getInitialCollapsedState());

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    
    // Lưu trạng thái vào localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
    }
  };

  const value = React.useMemo(() => ({ 
    collapsed, 
    toggleCollapsed 
  }), [collapsed]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}