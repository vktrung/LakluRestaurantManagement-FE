'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetMenusQuery, useGetMenuDishesQuery } from '@/features/menu/menuApiSlice';
import { useGetCategoriesQuery } from '@/features/category/categoryApiSlice';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, ShoppingBag, ShoppingCart } from 'lucide-react';
import { MenuItem, Menu, Category, MenuStatus } from '@/features/menu/types';
import OrderPanel from '../components/OrderPanel';

const MenuItemsList = ({
  menuId,
  selectedCategoryId,
  onAddItem,
  orderItems,
}: {
  menuId: number;
  selectedCategoryId: number | null;
  onAddItem: (menuItem: MenuItem) => void;
  orderItems: OrderItem[];
}) => {
  const { data: menuDetailData, isLoading: isMenuDetailLoading, isError: isMenuDetailError } = useGetMenuDishesQuery({
    menuId,
    activeOnly: true,
    page: 0,
    size: 100,
    ...(selectedCategoryId && { categoryId: selectedCategoryId }),
  });

  if (isMenuDetailLoading) {
    return <div className="text-center text-sm">Đang tải món...</div>;
  }

  if (isMenuDetailError || !menuDetailData?.data || menuDetailData.data.content.length === 0) {
    return <div className="text-center text-sm">Không có món nào trong menu này.</div>;
  }

  const itemsByCategory = menuDetailData.data.content.reduce((acc, item) => {
    const categoryName = item.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="py-4 space-y-4">
      {Object.entries(itemsByCategory).map(([categoryName, items]) => (
        <div key={categoryName}>
          <h3 className="font-semibold text-lg mb-2">{categoryName}</h3>
          {items.map((menuItem: MenuItem) => {
            const isInCart = orderItems.some((item) => item.menuItemsId === menuItem.id);
            return (
              <Card key={menuItem.id} className="overflow-hidden mb-2">
                <div className="flex items-center p-3 sm:p-4">
                  <div className="flex-shrink-0 mr-3 sm:mr-4">
                    {menuItem.dish.images && menuItem.dish.images.length > 0 ? (
                      <img
                        src={menuItem.dish.images[0].link || '/placeholder.svg'}
                        alt={menuItem.dish.name}
                        className="w-12 sm:w-16 h-12 sm:h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 sm:w-16 h-12 sm:h-16 bg-muted rounded flex items-center justify-center">
                        <ShoppingBag className="h-4 sm:h-6 w-4 sm:w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm sm:text-base">{menuItem.dish.name}</h3>
                    <p className="hidden sm:block text-sm text-muted-foreground line-clamp-2">
                      {menuItem.dish.description || 'Không có mô tả'}
                    </p>
                    <p className="font-bold text-green-600 mt-1 text-sm sm:text-base">
                      {menuItem.price.toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-3 sm:ml-4 h-8 sm:h-9 w-8 sm:w-9 sm:hidden"
                    onClick={() => onAddItem(menuItem)}
                  >
                    {isInCart ? (
                      <ShoppingCart className="h-4 w-4 text-green-600" />
                    ) : (
                      <PlusCircle className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    className="hidden sm:flex ml-4 h-9 text-sm"
                    onClick={() => onAddItem(menuItem)}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> Thêm
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
};

interface OrderItem {
  menuItemsId: number;
  dishId: number;
  quantity: number;
  name: string;
  image: string;
  price: number;
  category?: string;
}

const MenuPage = () => {
  const params = useParams();
  const reservationId = Number(params.id);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const { data: menusData, isLoading: isMenusLoading, isError: isMenusError } = useGetMenusQuery();
  const { data: categoriesData, isLoading: isCategoriesLoading, isError: isCategoriesError } = useGetCategoriesQuery();

  const handleAddItem = (menuItem: MenuItem) => {
    setOrderItems((prevItems) => {
      const updatedItems = [...prevItems];
      const existingItemIndex = updatedItems.findIndex((item) => item.menuItemsId === menuItem.id);

      if (existingItemIndex !== -1) {
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
      } else {
        updatedItems.push({
          menuItemsId: menuItem.id,
          dishId: menuItem.dishId,
          quantity: 1,
          name: menuItem.dish.name,
          image: menuItem.dish.images?.[0]?.link || '/placeholder.svg',
          price: menuItem.price,
          category: menuItem.category?.name || 'Uncategorized',
        });
      }
      return updatedItems;
    });
    if (window.innerWidth >= 640) {
      setShowOrderPanel(true);
    }
  };

  const handleRemoveItem = (menuItemsId: number) => {
    setOrderItems((prevItems) => prevItems.filter((item) => item.menuItemsId !== menuItemsId));
    if (orderItems.length <= 1) {
      setShowOrderPanel(false);
    }
  };

  const handleUpdateQuantity = (menuItemsId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(menuItemsId);
      return;
    }
    setOrderItems((prevItems) =>
      prevItems.map((item) => (item.menuItemsId === menuItemsId ? { ...item, quantity: newQuantity } : item)),
    );
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value === 'all' ? null : Number(value));
  };

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isMenusLoading || isCategoriesLoading) {
    return <div className="text-center text-sm p-4">Đang tải...</div>;
  }
  if (isMenusError || isCategoriesError) {
    return <div className="text-center text-sm p-4 text-destructive">Lỗi khi tải dữ liệu</div>;
  }

  const activeCategories = categoriesData?.data.filter((category: Category) => !category.isDeleted) || [];

  return (
    <div className="relative flex flex-col sm:flex-row min-h-screen p-3 sm:p-4 pb-[84px] sm:pb-4">
      {/* Menu Selection and Items */}
      <div className={`flex-1 ${showOrderPanel && window.innerWidth >= 640 ? 'sm:w-2/3' : 'w-full'}`}>
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ShoppingBag className="h-4 sm:h-5 w-4 sm:w-5" />
                Menu
              </CardTitle>
              <div className="w-[180px] sm:w-[200px]">
                <Select onValueChange={handleCategoryChange} defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {activeCategories.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-200px)] sm:h-[calc(100vh-250px)]">
              <Accordion
                type="single"
                collapsible
                onValueChange={setExpandedMenu}
                className="w-full"
              >
                {menusData && menusData.data.length > 0 ? (
                  menusData.data
                    .filter((menu: Menu) => menu.status === MenuStatus.ENABLE)
                    .map((menu: Menu) => (
                      <AccordionItem key={menu.id} value={menu.id.toString()}>
                        <AccordionTrigger className="hover:no-underline">
                          <Badge variant="outline" className="px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base font-medium">
                            {menu.name}
                          </Badge>
                        </AccordionTrigger>
                        <AccordionContent>
                          <MenuItemsList
                            menuId={menu.id}
                            selectedCategoryId={selectedCategoryId}
                            onAddItem={handleAddItem}
                            orderItems={orderItems}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))
                ) : (
                  <p className="text-sm">Không có menu nào.</p>
                )}
              </Accordion>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full h-8 sm:h-10 text-xs sm:text-sm"
              onClick={() => setShowOrderPanel(true)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Xem đơn hàng ({totalItems})
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Order Panel - Desktop */}
      {showOrderPanel && (
        <div className="hidden sm:block sm:w-1/3 p-3 sm:p-4">
          <OrderPanel
            orderItems={orderItems}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
            onClose={() => setShowOrderPanel(false)}
            reservationId={reservationId}
            menusData={menusData?.data || []}
          />
        </div>
      )}

      {/* Cart Button - Mobile */}
      {totalItems > 0 && (
        <div className="sm:hidden fixed bottom-[72px] right-4 z-50">
          <Button
            className="rounded-full h-12 w-12 bg-green-600 hover:bg-green-700 relative shadow-lg"
            onClick={() => setShowOrderPanel(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs">
              {totalItems}
            </Badge>
          </Button>
        </div>
      )}

      {/* Order Panel - Mobile (Full Screen) */}
      {showOrderPanel && (
        <div className="sm:hidden fixed top-0 left-0 right-0 h-screen bg-background overflow-y-auto z-50">
          <OrderPanel
            orderItems={orderItems}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
            onClose={() => setShowOrderPanel(false)}
            reservationId={reservationId}
            menusData={menusData?.data || []}
          />
        </div>
      )}
    </div>
  );
};

export default MenuPage;