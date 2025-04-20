'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetMenuByIdQuery } from '@/features/menu/menuApiSlice';
import { useGetMenuItemsByMenuIdQuery } from '@/features/menu-item/menuItemApiSlice';
import { useGetCategoriesQuery } from '@/features/category/categoryApiSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MenuItemList from '../components/MenuItemList';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, RefreshCw } from 'lucide-react';

export default function MenuItemPage() {
  const params = useParams();
  const router = useRouter();
  const menuId = Number(params.id);

  // Filter state
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [activeOnly, setActiveOnly] = useState<boolean | undefined>(undefined);
  const [pageSize, setPageSize] = useState(10);

  // Get menu data
  const {
    data: menuData,
    isLoading: isMenuLoading,
    error: menuError,
  } = useGetMenuByIdQuery(menuId);
  const menu = menuData?.data;

  // Get categories for filter
  const { data: categoriesData } = useGetCategoriesQuery();

  // Fetch menu items with filters
  const {
    data: menuItemsData,
    isLoading: isMenuItemsLoading,
    isFetching: isMenuItemsFetching,
    refetch: refetchMenuItems,
  } = useGetMenuItemsByMenuIdQuery(
    {
      id: menuId,
      categoryId,
      activeOnly,
      size: pageSize,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const menuItems = menuItemsData?.data?.content || [];

  // Function to apply filters
  const applyFilters = () => {
    // Apply filters without changing page
  };

  // Function to reset filters
  const resetFilters = () => {
    setCategoryId(undefined);
    setActiveOnly(undefined);
    setPageSize(10);
  };

  if (isMenuLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (menuError) {
    return (
      <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-destructive/10 text-destructive">
        <p className="text-lg font-medium">Không thể tải thông tin thực đơn</p>
        <p className="text-sm">Vui lòng thử lại sau</p>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-lg border border-gray-200">
        <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 font-medium text-lg">
          Không tìm thấy thực đơn
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 container py-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight space-y-1">
            Quản lý món ăn
          </h2>
          <p className="text-muted-foreground">
            Thực đơn: {menu?.name || 'Không có tên'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchMenuItems()}
            disabled={isMenuItemsFetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                isMenuItemsFetching ? 'animate-spin' : ''
              }`}
            />
            Làm mới
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/menu/menu-info')}
          >
            Quay lại
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Filter section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Danh mục</label>
              <Select
                value={categoryId?.toString() || 'all'}
                onValueChange={value => {
                  if (value === 'all') {
                    setCategoryId(undefined);
                  } else {
                    setCategoryId(Number(value));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categoriesData?.data
                    ?.filter(category => !category.isDeleted)
                    .map(category => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Trạng thái
              </label>
              <Select
                value={
                  activeOnly === undefined
                    ? 'all'
                    : activeOnly
                    ? 'true'
                    : 'false'
                }
                onValueChange={value => {
                  if (value === 'all') {
                    setActiveOnly(undefined);
                  } else {
                    setActiveOnly(value === 'true');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Vô hiệu hóa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Số món mỗi trang
              </label>
              <Select
                value={pageSize.toString()}
                onValueChange={value => setPageSize(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" onClick={resetFilters}>
              Đặt lại
            </Button>
            <Button onClick={applyFilters}>Áp dụng</Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading indicator */}
      {(isMenuItemsLoading || isMenuItemsFetching) && (
        <div className="flex justify-center items-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Menu item list */}
      {!isMenuItemsLoading && !isMenuItemsFetching && (
        <MenuItemList
          menuId={menuId}
          items={menuItems}
          onRefresh={refetchMenuItems}
        />
      )}
    </div>
  );
}
