"use client";

import { useGetMenuByIdQuery } from "@/features/menu/menuApiSlice";
import { MenuItemList } from "@/app/(private)/menu/menu-item/components/MenuItemList";
import { useParams } from "next/navigation";
import { Menu, MenuItem } from "@/features/menu/types";
import { useEffect, useState } from "react";

export default function Page() {
  const params = useParams();
  const menuId = Number(params.id);
  
  // State to track when to force refetch
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get menu data with menu items
  const { data, isLoading, error, refetch } = useGetMenuByIdQuery(menuId, {
    // This will cause the query to refetch when refreshKey changes
    skip: isNaN(menuId),
    refetchOnMountOrArgChange: true
  });

  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Force refetch when menuId changes
  useEffect(() => {
    if (menuId) {
      refetch();
    }
  }, [menuId, refetch]);

  // Function to trigger a refetch
  const handleRefresh = () => {
    refetch();
    // Increment refreshKey to force component updates
    setRefreshKey(prev => prev + 1);
  };

  if (!isClient) return null;
  
  if (isNaN(menuId)) {
    return <div>Error: Invalid menu ID</div>;
  }
  
  if (isLoading) return <div>Loading menu items...</div>;
  if (error) return <div>Error loading menu items: {error.toString()}</div>;

  const menu: Menu | null = data?.data ?? null;
  if (!menu) return <div>Loading menu...</div>;

  const menuItems: MenuItem[] = Array.isArray(menu.menuItems) ? menu.menuItems : [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Danh Sách Mục Menu: {menu.name}</h1>
      
      <MenuItemList
        key={refreshKey} 
        items={menuItems}
        onDelete={handleRefresh} 
        onSelect={(id) => console.log(`Select menu item with ID: ${id}`)}
        menuId={menuId}
        onAddSuccess={handleRefresh} 
      />
    </div>
  );
}