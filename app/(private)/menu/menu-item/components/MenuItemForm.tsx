'use client';

import React, { useState, useEffect } from 'react';
import {
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
} from '@/features/menu-item/menuItemApiSlice';
import { useGetAllDishesQuery } from '@/features/dish/dishApiSlice';
import { useGetCategoriesQuery } from '@/features/category/categoryApiSlice';
import { useGetMenusQuery } from '@/features/menu/menuApiSlice';
import { useGetMenuItemByIdQuery } from '@/features/menu-item/menuItemApiSlice';
import { MenuItemRequest } from '@/features/menu-item/types';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import DishFormAddOnly from './DishFormAddOnly';
import { useGetDishByIdQuery } from '@/features/dish/dishApiSlice';
import { MenuItem } from '@/features/menu/types'; // 🔥 Thêm dòng này

interface MenuItemFormProps {
  selectedItem: number | null;
  onSuccess: (newItem: MenuItem) => void; // 🆕 Callback để cập nhật UI
  onClose: () => void;
  menuId: number;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  selectedItem,
  onClose,
  onSuccess,
  menuId,
}) => {
  const [createMenuItem] = useCreateMenuItemMutation();
  const [updateMenuItem] = useUpdateMenuItemMutation();
  const [formData, setFormData] = useState<MenuItemRequest>({
    dishId: 0,
    menuId: menuId || 0, // Use menuId from prop as default
    categoryId: 0,
    price: 0,
    status: 'enable', // Default status
  });

  const {
    data: dishes,
    isLoading: dishesLoading,
    refetch,
  } = useGetAllDishesQuery();
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const { data: menus, isLoading: menusLoading } = useGetMenusQuery();

  const { data: menuItemData, isLoading: menuItemLoading } =
    useGetMenuItemByIdQuery(selectedItem!, {
      skip: !selectedItem, // Skip query if no selectedItem
    });
  const { data: selectedDishData } = useGetDishByIdQuery(formData.dishId, {
    skip: formData.dishId === 0,
  });

  const originalPrice = selectedDishData?.data?.price || 0;
  const [isDishFormOpen, setIsDishFormOpen] = useState(false);
  const [isClient, setIsClient] = useState(false); // Use isClient instead of isMounted for hydration

  useEffect(() => {
    setIsClient(true);

    if (selectedItem && menuItemData && menuItemData.data) {
      setFormData({
        dishId: menuItemData.data.dishId ?? 0,
        menuId: menuItemData.data.menuId ?? 0,
        categoryId: menuItemData.data.categoryId ?? 0,
        price: menuItemData.data.price ?? 0,
        status: menuItemData.data.status ?? 'enable',
      });
    } else {
      setFormData({
        dishId: 0,
        menuId: menuId || 0,
        categoryId: 0,
        price: 0,
        status: 'enable',
      });
    }
  }, [menuItemData, selectedItem, menuId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (selectedItem) {
        response = await updateMenuItem({ id: selectedItem, body: formData }).unwrap();
      } else {
        response = await createMenuItem(formData).unwrap();
        onSuccess(response.data[0]); 
      }
      onClose(); 
    } catch (error) {
      console.error("Lỗi khi thêm/cập nhật menu item:", error);
    }
  };
  

  const handleDishFormClose = () => {
    setIsDishFormOpen(false);
  };

  if (dishesLoading || categoriesLoading || menusLoading || menuItemLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {selectedItem ? 'Edit Menu Item' : 'Add Menu Item'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dish Dropdown with Plus Button */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dish
            </label>
            <div className="flex items-center gap-2">
              <select
                value={formData.dishId}
                onChange={e =>
                  setFormData({ ...formData, dishId: Number(e.target.value) })
                }
                className="block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={0}>Select a Dish</option>
                {dishes?.data.map(dish => (
                  <option key={dish.id} value={dish.id}>
                    {dish.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                onClick={e => {
                  e.stopPropagation(); // Prevents event bubbling

                  setIsDishFormOpen(true);
                }}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={e =>
                setFormData({ ...formData, categoryId: Number(e.target.value) })
              }
              className="block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={0}>Select a Category</option>
              {categories?.data.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Menu Dropdown (hidden if menuId is provided from prop) */}
          {!menuId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menu
              </label>
              <select
                value={formData.menuId}
                onChange={e =>
                  setFormData({ ...formData, menuId: Number(e.target.value) })
                }
                className="block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={0}>Select a Menu</option>
                {menus?.data.map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá Gốc
            </label>
            <input
              type="number"
              value={originalPrice}
              readOnly
              className="block w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>
          {/* Price and Discount Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={e =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Status Radio Buttons */}
          <div className="space-x-4">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="flex items-center">
              <label className="mr-4">
                <input
                  type="radio"
                  value="enable"
                  checked={formData.status === 'enable'}
                  onChange={() =>
                    setFormData({ ...formData, status: 'enable' })
                  }
                  className="mr-2"
                />
                Enable
              </label>
              <label>
                <input
                  type="radio"
                  value="disable"
                  checked={formData.status === 'disable'}
                  onChange={() =>
                    setFormData({ ...formData, status: 'disable' })
                  }
                  className="mr-2"
                />
                Disable
              </label>
            </div>
          </div>

          {/* Submit Button (matches DishFormAddOnly's CardFooter) */}
          <div className="mt-6">
            <Button
              type="submit"
              className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              {selectedItem ? 'Update' : 'Create'} Menu Item
            </Button>
          </div>
        </form>

        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          X
        </button>

        {/* DishFormAddOnly Modal */}
        {isDishFormOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-[1050]">
            <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-2xl">
              <DishFormAddOnly onClose={handleDishFormClose} />
              <Button
                onClick={handleDishFormClose}
                className="mt-4 bg-gray-900 text-white hover:bg-gray-800 rounded-lg"
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemForm;
