import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook để xóa cache trình duyệt
 * @param options - Các tùy chọn cấu hình
 * @param options.clearOnMount - Có xóa cache khi component mount không
 * @param options.clearOnUnmount - Có xóa cache khi component unmount không
 * @returns Các hàm để xóa cache
 */
const useClearCache = ({
  clearOnMount = false,
  clearOnUnmount = false,
} = {}) => {
  // Ref để tránh gọi clearCache trong lần render đầu tiên trên server
  const isMounted = useRef(false);

  /**
   * Xóa tất cả cache của trình duyệt
   */
  const clearBrowserCache = useCallback(async () => {
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
        console.log('🧹 Browser caches cleared');
      } catch (error) {
        console.error('Failed to clear browser caches:', error);
      }
    }
  }, []);

  /**
   * Xóa localStorage
   */
  const clearLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // Lưu trữ một số giá trị quan trọng để khôi phục sau
        const importantKeys = ['theme', 'sidebar-collapsed'];
        const savedValues: Record<string, string | null> = {};
        
        importantKeys.forEach(key => {
          savedValues[key] = window.localStorage.getItem(key);
        });
        
        window.localStorage.clear();
        
        // Khôi phục các giá trị quan trọng
        importantKeys.forEach(key => {
          if (savedValues[key]) {
            window.localStorage.setItem(key, savedValues[key] as string);
          }
        });
        
        console.log('🧹 LocalStorage cleared (giữ lại các giá trị UI quan trọng)');
      } catch (error) {
        console.error('Failed to clear localStorage:', error);
      }
    }
  }, []);

  /**
   * Xóa sessionStorage
   */
  const clearSessionStorage = useCallback(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.clear();
        console.log('🧹 SessionStorage cleared');
      } catch (error) {
        console.error('Failed to clear sessionStorage:', error);
      }
    }
  }, []);

  /**
   * Xóa tất cả các loại cache
   */
  const clearAllCache = useCallback(async () => {
    // Chỉ xóa cache trên client-side
    if (typeof window !== 'undefined') {
      await clearBrowserCache();
      clearLocalStorage();
      clearSessionStorage();
      console.log('🧹 All caches cleared');
    }
  }, [clearBrowserCache, clearLocalStorage, clearSessionStorage]);

  useEffect(() => {
    // Đánh dấu component đã mount
    isMounted.current = true;
    
    // Xóa cache khi component mount nếu được yêu cầu
    if (clearOnMount && typeof window !== 'undefined') {
      // Đợi một chút để đảm bảo hydration đã hoàn tất
      const timer = setTimeout(() => {
        if (isMounted.current) {
          clearAllCache();
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Xóa cache khi component unmount nếu được yêu cầu
    return () => {
      if (clearOnUnmount && typeof window !== 'undefined' && isMounted.current) {
        clearAllCache();
      }
    };
  }, [clearOnUnmount, clearAllCache]);

  return {
    clearBrowserCache,
    clearLocalStorage,
    clearSessionStorage,
    clearAllCache,
  };
};

export default useClearCache; 