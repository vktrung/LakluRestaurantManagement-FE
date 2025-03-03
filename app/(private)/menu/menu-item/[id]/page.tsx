"use client";
import { useGetMenuByIdQuery } from "@/features/menu/menuApiSlice";
import { MenuItemList } from "@/app/(private)/menu/menu-item/components/MenuItemList";
import { useParams } from "next/navigation";
import { Menu, MenuStatus, MenuItem } from "@/features/menu/types"; 
import { useEffect, useState } from "react"; 

export default function Page() {
  const params = useParams();
  const menuId = Number(params.id);  

  // 🟢 Gọi API lấy menu theo menuId
  const { data, isLoading, error, refetch } = useGetMenuByIdQuery(menuId);

  if (isNaN(menuId)) {
    return <div>Error: Invalid menu ID</div>;
  }

  const [isClient, setIsClient] = useState(false); 

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; 

  if (isLoading) return <div>Loading menu items...</div>;
  if (error) return <div>Error loading menu items: {error.toString()}</div>;

  const menu: Menu | null = data?.data ?? null;
  if (!menu) return <div>Loading menu...</div>;

  const menuItems: MenuItem[] = Array.isArray(menu.menuItems) ? menu.menuItems : [];

  const handleAddSuccess = () => {
    refetch(); 
  };

  const handleDeleteSuccess = () => {
    refetch(); 
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Danh Sách Mục Menu: {menu.name}</h1>
      <MenuItemList
        items={menuItems}
        onDelete={handleDeleteSuccess} // Cập nhật khi xóa món
        onSelect={(id) => console.log(`Select menu item with ID: ${id}`)}
        menuId={menuId}
        onAddSuccess={handleAddSuccess} // Cập nhật khi thêm món
      />
    </div>
  );
}
