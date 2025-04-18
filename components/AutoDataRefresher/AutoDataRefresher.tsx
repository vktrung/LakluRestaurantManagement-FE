'use client';

import React, { useEffect, useRef } from 'react';

interface AutoDataRefresherProps {
  /**
   * Hàm được gọi để làm mới dữ liệu
   */
  refreshFunction: () => void | Promise<void>;
  
  /**
   * Khoảng thời gian giữa các lần làm mới (tính bằng mili giây), mặc định 30 giây
   */
  interval?: number;
  
  /**
   * Có kích hoạt làm mới tự động không
   */
  enabled?: boolean;
  
  /**
   * Có làm mới ngay khi component mount không
   */
  refreshOnMount?: boolean;
  
  /**
   * Có làm mới khi component unmount không
   */
  refreshOnUnmount?: boolean;
  
  /**
   * Có làm mới khi tab được kích hoạt lại sau khi bị ẩn không
   */
  refreshOnVisibilityChange?: boolean;
  
  /**
   * Children component
   */
  children?: React.ReactNode;
}

/**
 * Component để tự động làm mới dữ liệu theo khoảng thời gian
 */
const AutoDataRefresher: React.FC<AutoDataRefresherProps> = ({
  refreshFunction,
  interval = 30000, // 30 giây
  enabled = true,
  refreshOnMount = true,
  refreshOnUnmount = false,
  refreshOnVisibilityChange = true,
  children,
}) => {
  // Sử dụng ref để lưu hàm làm mới mới nhất
  const refreshFunctionRef = useRef(refreshFunction);
  
  // Cập nhật ref khi hàm làm mới thay đổi
  useEffect(() => {
    refreshFunctionRef.current = refreshFunction;
  }, [refreshFunction]);
  
  // Quản lý interval để làm mới dữ liệu
  useEffect(() => {
    // Nếu không kích hoạt, không làm gì cả
    if (!enabled) return;
    
    // Hàm để gọi hàm làm mới
    const executeRefresh = () => {
      console.log('🔄 Auto refreshing data...');
      try {
        refreshFunctionRef.current();
      } catch (error) {
        console.error('Error during auto data refresh:', error);
      }
    };
    
    // Làm mới ngay khi mount nếu được yêu cầu
    if (refreshOnMount) {
      executeRefresh();
    }
    
    // Đặt interval để làm mới định kỳ
    const intervalId = setInterval(executeRefresh, interval);
    
    // Xử lý sự kiện thay đổi khả năng nhìn thấy tab
    const handleVisibilityChange = () => {
      if (refreshOnVisibilityChange && document.visibilityState === 'visible') {
        console.log('🔄 Tab became visible, refreshing data...');
        executeRefresh();
      }
    };
    
    // Đăng ký event listener cho sự kiện thay đổi khả năng nhìn thấy
    if (refreshOnVisibilityChange) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    // Cleanup khi component unmount
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Làm mới khi unmount nếu được yêu cầu
      if (refreshOnUnmount) {
        executeRefresh();
      }
    };
  }, [enabled, interval, refreshOnMount, refreshOnUnmount, refreshOnVisibilityChange]);
  
  // Component này không hiển thị gì cả, chỉ trả về children
  return <>{children}</>;
};

export default AutoDataRefresher; 