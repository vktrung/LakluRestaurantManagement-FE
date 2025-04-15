'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetMenuByIdQuery, useGetMenusQuery } from '@/features/menu/menuApiSlice';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, ShoppingBag, ShoppingCart } from 'lucide-react';
import { MenuItem, Menu } from '@/features/menu/types';
import OrderPanel from '../components/OrderPanel';

const MenuItemsList = ({
  menuId,
  onAddItem,
}: {
  menuId: number;
  onAddItem: (menuItem: MenuItem) => void;
}) => {
  const { data: menuDetailData, isLoading: isMenuDetailLoading } = useGetMenuByIdQuery(menuId, {
    skip: !menuId,
  });

  if (isMenuDetailLoading) {
    return <div className="text-center text-sm text-gray-600">Đang tải món...</div>;
  }

  if (!menuDetailData?.data || menuDetailData.data.menuItems.length === 0) {
    return <div className="text-center text-sm text-gray-600">Không có món nào trong menu này.</div>;
  }

  return (
    <div className="py-3 space-y-3">
      <div className="text-xs text-gray-500 mb-1.5">
        Phục vụ: {menuDetailData.data.startAt} - {menuDetailData.data.endAt}
      </div>
      {menuDetailData.data.menuItems.map((menuItem: MenuItem) => (
        <Card key={menuItem.id} className="overflow-hidden border-gray-200">
          <div className="flex items-center p-3">
            <div className="flex-shrink-0 mr-3">
              {menuItem.dish.images && menuItem.dish.images.length > 0 ? (
                <img
                  src={menuItem.dish.images[0].link || '/placeholder.svg'}
                  alt={menuItem.dish.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm sm:text-base">{menuItem.dish.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{menuItem.dish.description}</p>
              <p className="font-bold text-green-600 text-sm mt-0.5">{menuItem.price.toLocaleString('vi-VN')} VND</p>
            </div>
            <Button
              size="sm"
              className="ml-3 h-8 sm:h-9 text-xs sm:text-sm"
              onClick={() => onAddItem(menuItem)}
            >
              <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" /> Thêm
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

const MenuPage = () => {
  const params = useParams();
  const reservationId = Number(params.id);

  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [showOrderPanel, setShowOrderPanel] = useState(false);

  const [orderItems, setOrderItems] = useState<
    { menuItemsId: number; dishId: number; quantity: number; name: string; image: string; price: number }[]
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
        });
      }
      return updatedItems;
    });
    // Chỉ hiển thị OrderPanel trên desktop (≥640px)
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

  if (isMenusLoading) {
    return <div className="text-center text-sm text-gray-600 p-4">Đang tải...</div>;
  }
  if (isMenusError) {
    return <div className="text-center text-sm text-red-600 p-4">Lỗi khi tải menu</div>;
  }

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-full min-h-screen p-4">
      {/* Menu Selection and Items */}
      <div className="flex-1 sm:w-2/3 sm:pr-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
              Menu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-250px)] sm:h-[calc(100vh-200px)]">
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
                        <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium">
                          {menu.name}
                        </Badge>
                      </AccordionTrigger>
                      <AccordionContent>
                        <MenuItemsList menuId={menu.id} onAddItem={handleAddItem} />
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">Không có menu nào.</p>
                )}
              </Accordion>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full h-9 text-sm hidden sm:block"
              onClick={() => setShowOrderPanel(true)}
            >
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              Xem đơn hàng
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Order Panel for Desktop */}
      {showOrderPanel && (
        <div className="hidden sm:block sm:w-1/3">
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

      {/* Floating Cart Button for Mobile */}
      {orderItems.length > 0 && (
        <div className="sm:hidden fixed bottom-20 right-4 z-50">
          <Button
            className="rounded-full h-12 w-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg flex items-center justify-center relative"
            onClick={() => setShowOrderPanel(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5">
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>
      )}

      {/* Fullscreen Order Panel for Mobile */}
      {showOrderPanel && (
        <div className="sm:hidden fixed inset-0 bg-white z-50 flex flex-col">
          <OrderPanel
            orderItems={orderItems}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
            onClose={() => setShowOrderPanel(false)}
            reservationId={reservationId}
            menusData={menusData?.data || []}
            isMobile={true}
          />
        </div>
      )}
    </div>
  );
};

export default MenuPage;