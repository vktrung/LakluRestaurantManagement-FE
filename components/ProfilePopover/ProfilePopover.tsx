'use client';

import {
  Popover,
  Avatar,
  PopoverTrigger,
  PopoverContent,
} from '@nextui-org/react';
import styles from './ProfilePopover.module.scss';
import { CiSettings } from 'react-icons/ci';
import { PiSignOut, PiUser } from 'react-icons/pi';
import clsx from 'clsx';
import { useLogoutMutation } from '@/features/auth/authApiSlice';
import { clearCookies, getTokenFromCookie } from '@/utils/token';
import { toast } from 'sonner';
import { useLoading } from '@/components/Providers/LoadingProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const ProfilePopover = () => {
  // const [logout, { isLoading: isLoadingLogout, error: errorLogout }] =
  //   useLogoutMutation();

  // const { data: dataProfile, error, isLoading } = useGetMeQuery();
  // const router = useRouter();
  // const { showLoading, hideLoading } = useLoading();
  // const handleLogout = async () => {
  //   try {
  //     const refreshToken = getTokenFromCookie('auth-refresh-token');
  //     await logout({
  //       refreshToken,
  //     }).unwrap();
  //     clearCookies(['auth-refresh-token', 'auth-token']);
  //     router.push('/login');
  //   } catch (e: any) {
  //     toast.error(e.data.message);
  //   }
  // };

  // useEffect(() => {
  //   if (isLoadingLogout) {
  //     showLoading();
  //   } else {
  //     hideLoading();
  //   }

  //   return () => {
  //     hideLoading();
  //   };
  // }, [isLoadingLogout]);

  return (
    <Popover>
      <PopoverTrigger>
        <Avatar
          src="https://via.placeholder.com/40"
          alt="User Avatar"
          size="sm"
          className="cursor-pointer"
        />
      </PopoverTrigger>
      <PopoverContent>
        <div className={styles.popover}>
          {/* Header */}
          <div className={styles['menu-header']}>
            <div className="flex items-center gap-2">
              <Avatar
                src="https://via.placeholder.com/40"
                alt="User Avatar"
                size="md"
              />
              {/* <div>
                <p className="font-bold">{dataProfile?.name}</p>
                <p className={styles.email}>{dataProfile?.email}</p>
                <p className={styles.username}>@{dataProfile?.username}</p>
              </div> */}
            </div>
          </div>

          {/* Menu Items */}
          <div className="menu">
            <Link
              className={clsx(
                styles['menu-item'],
                'dark:hover:!bg-gray-100/10',
              )}
              href="/settings"
            >
              <CiSettings size={18} /> Settings
            </Link>
            <Link
              className={clsx(
                styles['menu-item'],
                'dark:hover:!bg-gray-100/10',
              )}
              href="/profile"
            >
              <PiUser size={18} /> Profile
            </Link>
          </div>

          {/* Logout */}
          <div className={styles.logout}
            // onClick={handleLogout}
          >
            <PiSignOut /> Log Out
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProfilePopover;
