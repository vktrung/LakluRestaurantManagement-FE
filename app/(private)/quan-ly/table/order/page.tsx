'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetMenusQuery, useGetMenuDishesQuery } from '@/features/menu/menuApiSlice';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { MenuItem, Menu } from '@/features/menu/types';
import OrderPanel from './OrderPanel';

const MenuItemsList = ({
  menuId,
  onAddItem,
  startAt,
  endAt,
}: {
  menuId: number;
  onAddItem: (menuItem: MenuItem) => void;
  startAt: string;
  endAt: string;
}) => {
  const { data: menuDishesData, isLoading: isMenuDishesLoading } = useGetMenuDishesQuery(
    {
      menuId,
      activeOnly: true,
      page: 0,
      size: 10,
    },
    { skip: !menuId }
  );

  if (isMenuDishesLoading) {
    return <div className="text-center text-sm sm:text-base">Đang tải món...</div>;
  }

  if (!menuDishesData?.data?.content || menuDishesData.data.content.length === 0) {
    return <div className="text-center text-sm sm:text-base">Không có món nào trong menu này.</div>;
  }

  return (
    <div className="py-3 sm:py-4 space-y-3 sm:space-y-4">
      <div className="text-xs sm:text-sm text-muted-foreground mb-2">
        Thời gian phục vụ: {startAt} đến {endAt}
      </div>
      {menuDishesData.data.content.map((menuItem: MenuItem) => (
        <Card key={menuItem.id} className="overflow-hidden">
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
              {menuItem.category && (
                <Badge variant="secondary" className="mt-1 text-xs sm:text-sm">
                  {menuItem.category.name}
                </Badge>
              )}
            </div>

            <Button
              size="sm"
              className="ml-3 sm:ml-4 h-8 sm:h-9 text-xs sm:text-sm"
              onClick={() => onAddItem(menuItem)}
            >
              <ShoppingCart className="h-3 sm:h-4 w-3 sm:w-4 mr-1" /> Thêm
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

const MenuPage = () => {
  const params = useParams();
  const reservationId = Number(params.id); // Extract reservationId from URL (e.g., 63)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [showOrderPanel, setShowOrderPanel] = useState(false);

  const [orderItems, setOrderItems] = useState<
    { menuItemsId: number; dishId: number; quantity: number; name: string; image: string; price: number; category?: string }[]
  >([]);

  const { data: menusData, isLoading: isMenusLoading, isError: isMenusError } = useGetMenusQuery();

  const handleAddItem = (menuItem: MenuItem) => {
    setOrderItems((prevItems) => {
      const updatedItems = [...prevItems];
      const existingItemIndex = updatedItems.findIndex((item) => item.dishId === menuItem.dish.id);

      if (existingItemIndex !== -1) {
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
      } else {
        updatedItems.push({
          menuItemsId: menuItem.id,
          dishId: menuItem.dish.id,
          quantity: 1,
          name: menuItem.dish.name,
          image: menuItem.dish.images?.[0]?.link || '/placeholder.svg',
          price: menuItem.price,
          category: menuItem.category?.name, // Add category for OrderPanel
        });
      }

      return updatedItems;
    });

    // Chỉ mở OrderPanel trên desktop
    if (window.innerWidth >= 640) {
      setShowOrderPanel(true);
    }
  };

  const handleRemoveItem = (dishId: number) => {
    setOrderItems((prevItems) => prevItems.filter((item) => item.dishId !== dishId));
    if (orderItems.length <= 1) {
      setShowOrderPanel(false);
    }
  };

  const handleUpdateQuantity = (dishId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(dishId);
      return;
    }

    setOrderItems((prevItems) =>
      prevItems.map((item) => (item.dishId === dishId ? { ...item, quantity: newQuantity } : item)),
    );
  };

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isMenusLoading) {
    return <div className="text-center text-sm sm:text-base p-4 sm:p-6">Đang tải...</div>;
  }
  if (isMenusError) {
    return <div className="text-center text-sm sm:text-base p-4 sm:p-6 text-destructive">Lỗi khi tải menu</div>;
  }

  return (
    <div className="relative flex flex-col sm:flex-row h-full p-3 sm:p-4 pb-20">
      {/* Menu Selection and Items */}
      <div className={`flex-1 ${showOrderPanel && window.innerWidth >= 640 ? 'sm:w-2/3' : 'w-full'}`}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <ShoppingBag className="h-4 sm:h-5 w-4 sm:w-5" />
              Menu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-150px)] sm:h-[calc(100vh-200px)]">
              <Accordion
                type="single"
                collapsible
                onValueChange={setExpandedMenu}
                className="w-full"
              >
                {menusData && menusData.data.length > 0 ? (
                  menusData.data.map((menu: Menu) => (
                    <AccordionItem key={menu.id} value={menu.id.toString()}>
                      <AccordionTrigger className="hover:no-underline">
                        <Badge variant="outline" className="px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base font-medium">
                          {menu.name}
                        </Badge>
                      </AccordionTrigger>
                      <AccordionContent>
                        <MenuItemsList
                          menuId={menu.id}
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
      )}

      {/* Order Panel - Mobile (Bottom Sheet) */}
      {showOrderPanel && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg max-h-[50vh] overflow-y-auto z-50">
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
