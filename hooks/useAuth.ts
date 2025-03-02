// hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { getCookie, deleteCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import {
  getCurrentUser,
  hasAnyPermission,
  hasPermission,
  UserData,
} from '@/services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const token = getCookie('auth_token') as string | undefined;

      if (!token) {
        setLoading(false);
        router.push('/login');
        return;
      }

      try {
        const userData = await getCurrentUser(token);
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const logout = () => {
    deleteCookie('auth_token');
    setUser(null);
    router.push('/login');
    router.refresh(); // Đảm bảo làm mới state sau khi đăng xuất
  };

  const checkPermission = (permission: string): boolean => {
    return hasPermission(user, permission);
  };

  const checkAnyPermission = (permissions: string[]): boolean => {
    return hasAnyPermission(user, permissions);
  };

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
  };
};

// Server-side helper
// utils/auth.ts
