'use client';

import React, { useEffect } from 'react';
import useClearCache from '@/hooks/useClearCache';

/**
 * Component bọc ngoài các trang không cần cache
 * Component này đảm bảo rằng cache được xóa khi trang được mount và unmount
 */
export const NoCachePage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sử dụng hook để xóa cache khi mount và unmount
  useClearCache({ clearOnMount: true, clearOnUnmount: true });

  // Thêm meta tags khi component mount
  useEffect(() => {
    // Thêm meta tags để ngăn chặn caching
    const addNoCacheMetaTags = () => {
      const head = document.head;
      
      // Tạo và thêm thẻ Cache-Control
      const cacheControlMeta = document.createElement('meta');
      cacheControlMeta.httpEquiv = 'Cache-Control';
      cacheControlMeta.content = 'no-cache, no-store, must-revalidate';
      head.appendChild(cacheControlMeta);
      
      // Tạo và thêm thẻ Pragma
      const pragmaMeta = document.createElement('meta');
      pragmaMeta.httpEquiv = 'Pragma';
      pragmaMeta.content = 'no-cache';
      head.appendChild(pragmaMeta);
      
      // Tạo và thêm thẻ Expires
      const expiresMeta = document.createElement('meta');
      expiresMeta.httpEquiv = 'Expires';
      expiresMeta.content = '0';
      head.appendChild(expiresMeta);
    };
    
    // Gọi hàm thêm meta tags
    addNoCacheMetaTags();
    
    // Xóa meta tags khi component unmount
    return () => {
      // Tìm và xóa các meta tags đã thêm
      document.querySelectorAll('meta[http-equiv="Cache-Control"], meta[http-equiv="Pragma"], meta[http-equiv="Expires"]')
        .forEach(element => element.remove());
    };
  }, []);

  return <>{children}</>;
};

export default NoCachePage; 