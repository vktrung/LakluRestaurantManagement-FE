'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { PlusIcon, AlertCircle } from 'lucide-react';
import DishFormAddOnly from './DishFormAddOnly';
import { useGetDishByIdQuery } from '@/features/dish/dishApiSlice';
import { MenuItem } from '@/features/menu/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MenuItemFormProps {
  selectedItem: number | null;
  onSuccess: (newItem: MenuItem) => void;
  onClose: () => void;
  menuId: number;
}

// Add a CSS module for the custom dropdown styles
const customDropdownStyles = {
  dropdown: `absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto`,
  option: `px-3 py-2 cursor-pointer hover:bg-gray-100`,
  selected: `bg-gray-100`,
  empty: `px-3 py-2 text-gray-500 italic`,
};

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  selectedItem,
  onClose,
  onSuccess,
  menuId,
}) => {
  const [createMenuItem, { isLoading: isCreating }] =
    useCreateMenuItemMutation();
  const [updateMenuItem, { isLoading: isUpdating }] =
    useUpdateMenuItemMutation();
  const [formData, setFormData] = useState<MenuItemRequest>({
    dishId: 0,
    menuId: menuId || 0,
    categoryId: 0,
    price: 0,
    status: 'enable',
  });
  const [inputValue, setInputValue] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState({
    dishId: '',
    categoryId: '',
    price: '',
  });

  const {
    data: dishes,
    isLoading: dishesLoading,
    refetch: refetchDishes,
  } = useGetAllDishesQuery();
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const { data: menus, isLoading: menusLoading } = useGetMenusQuery();
  const { data: menuItemData, isLoading: menuItemLoading } =
    useGetMenuItemByIdQuery(selectedItem!, { skip: !selectedItem });
  const { data: selectedDishData } = useGetDishByIdQuery(formData.dishId, {
    skip: formData.dishId === 0,
  });

  const originalPrice = selectedDishData?.data?.price || 0;
  const [isDishFormOpen, setIsDishFormOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [showOptions, setShowOptions] = useState(false);
  const [filteredDishes, setFilteredDishes] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoading =
    isCreating ||
    isUpdating ||
    dishesLoading ||
    categoriesLoading ||
    menusLoading ||
    (menuItemLoading && selectedItem != null);

  useEffect(() => {
    setIsClient(true);

    if (selectedItem && menuItemData && menuItemData.data) {
      const newFormData = {
        dishId: menuItemData.data.dishId ?? 0,
        menuId: menuItemData.data.menuId ?? 0,
        categoryId: menuItemData.data.categoryId ?? 0,
        price: menuItemData.data.price ?? 0,
        status: menuItemData.data.status ?? 'enable',
      };
      setFormData(newFormData);
      const dishName =
        dishes?.data.find(dish => dish.id === newFormData.dishId)?.name || '';
      setInputValue(dishName);
    } else {
      setFormData({
        dishId: 0,
        menuId: menuId || 0,
        categoryId: 0,
        price: 0,
        status: 'enable',
      });
      setInputValue('');
    }
  }, [menuItemData, selectedItem, menuId, dishes]);

  // Add new useEffect for filtering dishes based on input
  useEffect(() => {
    if (dishes?.data) {
      const filtered = dishes.data.filter(dish =>
        dish.name.toLowerCase().includes(inputValue.toLowerCase()),
      );
      setFilteredDishes(filtered);
    }
  }, [inputValue, dishes]);

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const validateForm = () => {
    const errors = {
      dishId: '',
      categoryId: '',
      price: '',
    };
    let isValid = true;

    if (!formData.dishId || formData.dishId === 0) {
      errors.dishId = 'Vui lòng chọn món ăn';
      isValid = false;
    }

    if (!formData.categoryId || formData.categoryId === 0) {
      errors.categoryId = 'Vui lòng chọn danh mục';
      isValid = false;
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = 'Giá món ăn phải lớn hơn 0';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    try {
      let response;
      if (selectedItem) {
        response = await updateMenuItem({
          id: selectedItem,
          body: formData,
        }).unwrap();
        onSuccess(response.data[0]);
      } else {
        response = await createMenuItem(formData).unwrap();
        onSuccess(response.data[0]);
      }
      onClose();
    } catch (error: any) {
      console.error('Lỗi khi thêm/cập nhật menu item:', error);

      if (error?.data) {
        const { message, httpStatus, error: errorCode } = error.data;

        if (httpStatus === 400) {
          if (message) {
            setApiError(message);
          } else {
            setApiError(
              'Dữ liệu không hợp lệ. Vui lòng kiểm tra thông tin nhập vào.',
            );
          }
        } else if (httpStatus === 409) {
          setApiError(
            'Món ăn này đã tồn tại trong thực đơn. Vui lòng chọn món ăn khác.',
          );
        } else if (message) {
          setApiError(message);
        } else {
          setApiError(
            'Đã xảy ra lỗi khi lưu món ăn thực đơn. Vui lòng thử lại sau.',
          );
        }
      } else {
        setApiError(
          'Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại sau.',
        );
      }
    }
  };

  const handleDishFormClose = () => {
    setIsDishFormOpen(false);
    refetchDishes();
  };

  const handleDishSelect = (dish: any) => {
    setInputValue(dish.name);
    setFormData({ ...formData, dishId: dish.id });
    setShowOptions(false);
  };

  if (
    dishesLoading ||
    categoriesLoading ||
    menusLoading ||
    (menuItemLoading && selectedItem)
  ) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {selectedItem ? 'Cập nhật món ăn thực đơn' : 'Thêm món ăn thực đơn'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Dish Input with Custom Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Món ăn <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => {
                    const value = e.target.value;
                    setInputValue(value);
                    setShowOptions(true);
                  }}
                  onFocus={() => setShowOptions(true)}
                  placeholder="Nhập hoặc chọn món ăn"
                  className="block w-full p-2 border border-gray-300 rounded-md"
                  disabled={isLoading}
                />

                {showOptions && (
                  <div
                    ref={dropdownRef}
                    className={customDropdownStyles.dropdown}
                  >
                    {filteredDishes.length > 0 ? (
                      filteredDishes.map(dish => (
                        <div
                          key={dish.id}
                          className={`${customDropdownStyles.option} ${
                            formData.dishId === dish.id
                              ? customDropdownStyles.selected
                              : ''
                          }`}
                          onClick={() => handleDishSelect(dish)}
                        >
                          <div className="font-medium">{dish.name}</div>
                          <div className="text-xs text-gray-500">
                            Giá: {dish.price.toLocaleString('vi-VN')} VND
                            {dish.requiresPreparation && ' • Cần chuẩn bị'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={customDropdownStyles.empty}>
                        Không tìm thấy món ăn
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  setIsDishFormOpen(true);
                }}
                disabled={isLoading}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            {formErrors.dishId && (
              <p className="text-red-500 text-xs mt-1">{formErrors.dishId}</p>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={e =>
                setFormData({ ...formData, categoryId: Number(e.target.value) })
              }
              className="block w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            >
              <option value={0}>Chọn danh mục</option>
              {categories?.data.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formErrors.categoryId && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.categoryId}
              </p>
            )}
          </div>

          {/* Menu Dropdown (hidden if menuId is provided from prop) */}
          {!menuId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menu <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.menuId}
                onChange={e =>
                  setFormData({ ...formData, menuId: Number(e.target.value) })
                }
                className="block w-full p-2 border border-gray-300 rounded-md"
                disabled={isLoading}
              >
                <option value={0}>Chọn thực đơn</option>
                {menus?.data.map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Original Price */}
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
                Giá <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={e =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="block w-full p-2 border border-gray-300 rounded-md"
                disabled={isLoading}
              />
              {formErrors.price && (
                <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
              )}
            </div>
          </div>

          {/* Status Radio Buttons */}
          <div className="space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Trạng thái
            </label>
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
                  disabled={isLoading}
                />
                Hoạt động
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
                  disabled={isLoading}
                />
                Vô hiệu hóa
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <Button
              type="submit"
              className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              disabled={isLoading}
            >
              {isLoading
                ? 'Đang xử lý...'
                : selectedItem
                ? 'Cập nhật'
                : 'Tạo mới'}
            </Button>
          </div>
        </form>

        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          disabled={isLoading}
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
