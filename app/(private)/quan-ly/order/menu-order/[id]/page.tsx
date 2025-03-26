'use client'
import { useGetMenuByIdQuery } from '@/features/menu/menuApiSlice';
import { useParams } from 'next/navigation';
import MenuPage from '../components/MenuOrder';

const MenuItemPage = () => {
  const { id } = useParams(); // Extract 'id' from the URL parameters
  const { data, isLoading, isError, error } = useGetMenuByIdQuery(Number(id), {
    skip: !id, // Skip the query if id is not available
  });

  // Handle loading state
  if (isLoading) return <div>Loading...</div>;

  // Handle error state
 

  

  return <div><MenuPage reservationId={id } /></div>;
};

export default MenuItemPage;
