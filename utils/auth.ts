import { UserData } from '@/services/authService';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';

export const getServerSideUser = (): UserData | null => {
  const headersList = headers();
  const userData = headersList.get('x-user-data');

  if (!userData) {
    return null;
  }

  try {
    return JSON.parse(userData) as UserData;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
};

export const serverHasPermission = (permission: string): boolean => {
  const user = getServerSideUser();
  return user?.permissions?.includes(permission) || false;
};

export const serverHasAnyPermission = (permissions: string[]): boolean => {
  const user = getServerSideUser();
  if (!user || !user.permissions) {
    return false;
  }

  return permissions.some(permission => user.permissions.includes(permission));
};