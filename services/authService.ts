import { setCookie, getCookie, deleteCookie } from 'cookies-next';
import type { CookieValueTypes } from 'cookies-next';

export interface UserData {
  id: number;
  username: string;
  email: string;
  permissions: string[];
  nameSalary: string;
}

interface LoginResponse {
  data: {
    token: string;
    user?: UserData;
  };
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

export const login = async (username: string, password: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Đăng nhập thất bại');
    }

    const data: LoginResponse = await response.json();
    console.log('Login data:', data);
    // Lưu token vào cookie
    setCookie('auth_token', data.data.token, {
      path: '/',
      maxAge: 60 * 60 * 24, // 1 ngày
    });

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  deleteCookie('auth_token');
  window.location.href = '/login';
};

export const getCurrentUser = async (
  token: string,
): Promise<UserData | null> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Kiểm tra xem người dùng có quyền cụ thể không
export const hasPermission = (
  user: UserData | null,
  permission: string,
): boolean => {
  if (!user || !user.permissions) {
    return false;
  }

  return user.permissions.includes(permission);
};

// Kiểm tra xem người dùng có một trong các quyền không
export const hasAnyPermission = (
  user: UserData | null,
  permissions: string[],
): boolean => {
  if (!user || !user.permissions) {
    return false;
  }

  return permissions.some(permission => user.permissions.includes(permission));
};
