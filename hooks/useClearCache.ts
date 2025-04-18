import { useCallback, useEffect } from 'react';

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
        window.localStorage.clear();
        console.log('🧹 LocalStorage cleared');
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
    await clearBrowserCache();
    clearLocalStorage();
    clearSessionStorage();
    console.log('🧹 All caches cleared');
  }, [clearBrowserCache, clearLocalStorage, clearSessionStorage]);

  useEffect(() => {
    // Xóa cache khi component mount nếu được yêu cầu
    if (clearOnMount) {
      clearAllCache();
    }

    // Xóa cache khi component unmount nếu được yêu cầu
    return () => {
      if (clearOnUnmount) {
        clearAllCache();
      }
    };
  }, [clearOnMount, clearOnUnmount, clearAllCache]);

  return {
    clearBrowserCache,
    clearLocalStorage,
    clearSessionStorage,
    clearAllCache,
  };
};

export default useClearCache; 