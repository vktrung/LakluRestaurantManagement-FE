'use client';
import { useGetMyProfileQuery } from '@/features/profile/profileApiSlice';

export const ProfilePage = () => {
  const { data: dataProfile, error, isLoading } = useGetMyProfileQuery();
  return <div>Profile Page</div>;
};
