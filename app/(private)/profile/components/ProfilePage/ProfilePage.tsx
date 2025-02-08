'use client';
import { useGetMeQuery } from '@/features/user/userApiSlice';

export const ProfilePage = () => {
  const { data: dataProfile, error, isLoading } = useGetMeQuery();
  return <div>Profile Page</div>;
};
