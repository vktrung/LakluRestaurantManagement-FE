'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGetMenusQuery, useGetMenuDishesQuery } from '@/features/menu/menuApiSlice';
import { useGetCategoriesQuery } from '@/features/category/categoryApiSlice';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, ShoppingCart, PlusCircle } from 'lucide-react';
import { MenuItem, Menu, Category, MenuStatus } from '@/features/menu/types';
import OrderPanel from './OrderPanel';

const MenuItemsList = ({
  menuId,
  selectedCategoryId,
  onAddItem,
  startAt,
  endAt,
}: {
  menuId: number;
  selectedCategoryId: number | null;
  onAddItem: (menuItem: MenuItem) => void;
  startAt: string;
  endAt: string;
}) => {
  const { data: menuDishesData, isLoading: isMenuDishesLoading } = useGetMenuDishesQuery(
    {
      menuId,
      activeOnly: true,
      page: 0,
      size: 100, // Lấy tất cả món ăn
      ...(selectedCategoryId && { categoryId: selectedCategoryId }), // Lọc theo categoryId
    },
    { skip: !menuId }
  );

  if (isMenuDishesLoading) {
    return <div className="text-center text-sm sm:text-base">Đang tải món...</div>;
  }

  if (!menuDishesData?.data?.content || menuDishesData.data.content.length === 0) {
    return <div className="text-center text-sm sm:text-base">Không có món nào trong menu này.</div>;
  }

  // Group items by category name
  const itemsByCategory = menuDishesData.data.content.reduce((acc, item) => {
    const categoryName = item.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="py-3 sm:py-4 space-y-3 sm:space-y-4">
      {Object.entries(itemsByCategory).map(([categoryName, items]) => (
        <div key={categoryName}>
          <h3 className="font-semibold text-sm sm:text-lg mb-2">{categoryName}</h3>
          {items.map((menuItem: MenuItem) => (
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
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {menuItem.dish.description || 'Không có mô tả'}
                  </p>
                  <p className="font-bold text-green-600 mt-1 text-sm sm:text-base">
                    {menuItem.price.toLocaleString('vi-VN')} VND
                  </p>
                </div>
                {/* Desktop button with text */}
                <Button
                  size="sm"
                  className="ml-3 sm:ml-4 h-8 sm:h-9 text-xs sm:text-sm hidden sm:flex"
                  onClick={() => onAddItem(menuItem)}
                >
                  <ShoppingCart className="h-3 sm:h-4 w-3 sm:w-4 mr-1" /> Thêm
                </Button>
                {/* Mobile button with just + icon */}
                <Button
                  size="icon"
                  className="ml-3 h-8 w-8 sm:hidden bg-green-600 hover:bg-green-700"
                  onClick={() => onAddItem(menuItem)}
                  aria-label="Thêm vào giỏ hàng"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
};

const MenuPage = () => {
  const params = useParams();
  const reservationId = Number(params.id);
  const [expandedMenu, setExpandedMenu] = useState<string | undefined>(undefined);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<
    { menuItemsId: number; dishId: number; quantity: number; name: string; image: string; price: number; category?: string }[]
  >([]);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

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

    // Only auto-open the panel on desktop
    if (!isMobile) {
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
    return <div className="text-center text-sm sm:text-base p-4 sm:p-6">Đang tải...</div>;
  }
  if (isMenusError || isCategoriesError) {
    return <div className="text-center text-sm sm:text-base p-4 sm:p-6 text-destructive">Lỗi khi tải dữ liệu</div>;
  }

  const activeCategories = categoriesData?.data.filter((category: Category) => !category.isDeleted) || [];

  return (
    <div className="relative flex flex-col sm:flex-row h-full p-3 sm:p-4 pb-20">
      {/* Menu Selection and Items */}
      <div className={`flex-1 ${showOrderPanel && !isMobile ? 'sm:w-2/3' : 'w-full'}`}>
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
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
          <CardContent className="flex-1 pb-2">
            <ScrollArea className="h-[calc(100vh-230px)] sm:h-[calc(100vh-240px)]">
              <Accordion
                type="single"
                collapsible
                value={expandedMenu}
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
                            startAt={menu.startAt}
                            endAt={menu.endAt}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))
                ) : (
                  <p className="text-sm sm:text-base">Không có menu nào.</p>
                )}
              </Accordion>
            </ScrollArea>
          </CardContent>
          <CardFooter className="pt-2 mt-auto">
            <Button 
              variant="default" 
              className="w-full h-8 sm:h-10 text-xs sm:text-sm bg-green-600 hover:bg-green-700" 
              onClick={() => setShowOrderPanel(true)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Xem đơn hàng ({totalItems})
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Order Panel - Desktop */}
      {showOrderPanel && !isMobile && (
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

      {/* Cart Button - Mobile
      {totalItems > 0 && (
        <div className="sm:hidden fixed bottom-20 right-4 z-50">
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
      )} */}

      {/* Order Panel - Mobile (Full Screen) */}
      {showOrderPanel && isMobile && (
        <div className="sm:hidden fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="p-4">
            <OrderPanel
              orderItems={orderItems}
              onRemoveItem={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
              onClose={() => setShowOrderPanel(false)}
              reservationId={reservationId}
              menusData={menusData?.data || []}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;