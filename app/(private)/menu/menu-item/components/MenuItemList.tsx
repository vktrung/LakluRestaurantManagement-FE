'use client';
import React, { useState, useEffect } from 'react';
import { MenuItem } from '@/features/menu/types';
import { useGetDishByIdQuery } from '@/features/dish/dishApiSlice';
import { useGetCategoryByIdQuery } from '@/features/category/categoryApiSlice';
import { useGetMenuByIdQuery } from '@/features/menu/menuApiSlice';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { CalendarIcon, Edit2Icon, Trash2Icon, PlusIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { MenuItemForm } from './MenuItemForm';
import { useDeleteMenuItemMutation } from '@/features/menu-item/menuItemApiSlice';
import DeleteConfirmation from './DeleteConfirmation';
import { Badge } from '@/components/ui/badge';
interface MenuItemListProps {
  items: MenuItem[];
  onDelete: () => void;
  onSelect: (id: number) => void;
  menuId: number;
  onAddSuccess: () => void;
}

export const MenuItemList: React.FC<MenuItemListProps> = ({
  items,
  menuId,
  onDelete,
  onAddSuccess,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(items);
  const [deleteMenuItem] = useDeleteMenuItemMutation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [deleteItemName, setDeleteItemName] = useState<string>('');

  useEffect(() => {
    setMenuItems(items);
  }, [items]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteItemId(id);
    setDeleteItemName(name);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteItemId !== null) {
      try {
        await deleteMenuItem(deleteItemId).unwrap();
        setMenuItems(prevItems =>
          prevItems.filter(item => item.id !== deleteItemId),
        );
        onDelete();
      } catch (error) {
        console.error('Lỗi khi xóa menu item:', error);
      }
    }
    setIsDeleteModalOpen(false);
    setDeleteItemId(null);
    setDeleteItemName('');
  };

  const handleEdit = (id: number) => {
    setSelectedItemId(id);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedItemId(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (newItem: MenuItem) => {
    setMenuItems(prevItems => [...prevItems, newItem]);
    onAddSuccess();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedItemId(null);
  };

  const renderContent = () => {
    if (menuItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-lg border border-gray-200">
          <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium text-lg">
            Không có mục menu nào trong danh sách
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems
          .filter(item => item !== undefined && item !== null)
          .map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              onDelete={handleDeleteClick}
              onSelect={handleEdit}
            />
          ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex justify-end mt-6 mb-4">
        <Button
          onClick={handleAdd}
          className="bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-1.5" />
          Thêm món ăn trong thực đơn
        </Button>
      </div>

      <div className="mb-8">
        <Separator className="mt-4 bg-gray-200" />
      </div>

      <div className="ml-auto">{renderContent()}</div>

      {/* MenuItemForm Modal */}
      {isFormOpen && (
        <MenuItemForm
          selectedItem={selectedItemId}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          menuId={menuId}
        />
      )}

      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={deleteItemName}
      />
    </div>
  );
};

const MenuItemCard: React.FC<{
  item: MenuItem;
  onDelete: (id: number, name: string) => void;
  onSelect: (id: number) => void;
}> = ({ item, onDelete, onSelect }) => {
  const { data: dishData } = useGetDishByIdQuery(item.dishId);
  const { data: categoryData } = useGetCategoryByIdQuery(item.categoryId);
  const { data: menuData } = useGetMenuByIdQuery(item.menuId);
  const dish = dishData?.data;
  const category = categoryData?.data;
  const menu = menuData?.data;

  return (
    <Card className="overflow-hidden border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
      <div className="relative h-52 w-full bg-gray-100 overflow-hidden group">
        {dish?.images && dish.images.length > 0 ? (
          <Image
            src={dish.images[0].link || '/images/placeholder-image.jpg'}
            alt={dish.name || 'Hình ảnh mục menu'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
            priority={true}
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gray-200">
            <CalendarIcon className="h-12 w-12 text-gray-400" />
            <span className="sr-only">Không có ảnh</span>
          </div>
        )}
      </div>
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-xl font-semibold text-gray-900 line-clamp-1">
          {dish?.name || 'Không có tên'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
          {dish?.description || 'Không có mô tả'}
        </p>
        <div className="flex flex-col gap-1.5 text-xs text-gray-500 pt-2">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Danh mục: {category?.name || 'Không có'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Menu: {menu?.name || 'Không có'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg text-black">
              Giá: {item.price.toLocaleString('vi-VN')} VND
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {typeof dish?.requiresPreparation === 'boolean' && (
              <Badge
                variant={dish.requiresPreparation ? 'secondary' : 'outline'}
                className={`mt-1 text-xs ${
                  dish.requiresPreparation
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {dish.requiresPreparation
                  ? 'Cần chuẩn bị trước'
                  : 'Chuẩn bị nhanh'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3 pt-3 pb-4 border-t border-gray-200">
        <Button
          variant="outline"
          size="sm"
          className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
          onClick={() => onSelect(item.id)}
        >
          <Edit2Icon className="h-4 w-4 mr-1.5" />
          Sửa
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(item.id, dish?.name || 'mục này')}
        >
          <Trash2Icon className="h-4 w-4 mr-1.5" />
          Xóa
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MenuItemList;
