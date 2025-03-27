// cashier-order/[reservationId]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import {
  useGetMenusQuery,
  useGetMenuItemByIdQuery,
} from '@/features/menu/menuApiSlice';
import { useGetDishByIdQuery } from '@/features/dish/dishApiSlice';
import { useGetCategoryByIdQuery } from '@/features/category/categoryApiSlice';
import { useGetMenuByIdQuery } from '@/features/menu/menuApiSlice';
import { Menu, MenuItem } from '@/features/menu/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { CalendarIcon, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

const OrderDetailPage = ({ params }: { params: { reservationId: string } }) => {
  const { reservationId } = params;
  const router = useRouter();

  const {
    data: menusData,
    isLoading: isMenusLoading,
    error: menusError,
  } = useGetMenusQuery();
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: menuData, isLoading: isMenuLoading } = useGetMenuItemByIdQuery(
    selectedMenuId || 0,
    {
      skip: !selectedMenuId,
    },
  );

  // Sử dụng useEffect để khởi tạo selectedMenuId
  useEffect(() => {
    if (menusData?.data && menusData.data.length > 0 && !selectedMenuId) {
      setSelectedMenuId(menusData.data[0].id);
    }
  }, [menusData]);

  // Xử lý trạng thái tải và lỗi
  if (isMenusLoading) return <div className="w-full p-6">Đang tải...</div>;
  if (menusError)
    return <div className="w-full p-6">Không thể tải danh sách thực đơn</div>;

  const menus = menusData?.data || [];
  const menuItems = menuData?.data?.menuItems || [];

  // Lọc menu_items theo searchTerm
  const filteredMenuItems = menuItems.filter((item: MenuItem) =>
    item.dish?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Hàm chuyển đến trang thanh toán
  const handleGoToPayment = () => {
    // Giả định rằng chúng ta có orderId tương ứng với reservationId
    // Trong trường hợp thực tế, bạn có thể cần lấy orderId từ API
    router.push(`/payment/${reservationId}`);
  };

  return (
    <div className="space-y-4 p-4">
      {/* Tiêu đề và nút thanh toán */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Sản phẩm</h2>
        <Button 
          onClick={handleGoToPayment}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Thanh toán
        </Button>
      </div>

      {/* Ô tìm kiếm */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Tìm kiếm sản phẩm"
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {menus.map((menu: Menu) => (
          <Button
            key={menu.id}
            onClick={() => setSelectedMenuId(menu.id)}
            variant={selectedMenuId === menu.id ? 'default' : 'outline'}
          >
            {menu.name}
          </Button>
        ))}
      </div>

      {/* Danh sách món ăn */}
      {isMenuLoading ? (
        <div>Đang tải món ăn...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMenuItems.length === 0 ? (
            <div className="col-span-full text-center py-8">
              Không có món ăn nào
            </div>
          ) : (
            filteredMenuItems.map((item: MenuItem) => (
              <MenuItemCard key={item.id} item={item} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Component để hiển thị từng menu item
const MenuItemCard: React.FC<{ item: MenuItem }> = ({ item }) => {
  // Lấy thông tin chi tiết của dish, category, và menu
  const { data: dishData } = useGetDishByIdQuery(item.dishId);
  const { data: categoryData } = useGetCategoryByIdQuery(item.categoryId);
  const { data: menuData } = useGetMenuByIdQuery(item.menuId);

  const dish = dishData?.data;
  const category = categoryData?.data;
  const menu = menuData?.data;

  return (
    <Card className="overflow-hidden border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Hình ảnh */}
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

      {/* Tiêu đề */}
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-xl font-semibold text-gray-900 line-clamp-1">
          {dish?.name || 'Không có tên'}
        </CardTitle>
      </CardHeader>

      {/* Nội dung */}
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
        </div>

        {/* Nút Thêm vào order */}
        <Button className="w-full bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors">
          Thêm vào order
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderDetailPage;
