'use client';

import { useState } from 'react';
import { useGetMenusQuery, useGetMenuByIdQuery } from '@/features/menu/menuApiSlice';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, ShoppingBag, ShoppingCart } from 'lucide-react';
import { MenuItem, Menu } from '@/features/menu/types';  // Import necessary types
import OrderPanel from './OrderPanel';

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
    return <div>Loading items...</div>;
  }

  if (!menuDetailData?.data || menuDetailData.data.menuItems.length === 0) {
    return <div>No items available in this menu.</div>;
  }

  return (
    <div className="py-4 space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        Available from {menuDetailData.data.startAt} to {menuDetailData.data.endAt}
      </div>
      {menuDetailData.data.menuItems.map((menuItem: MenuItem) => (
        <Card key={menuItem.id} className="overflow-hidden">
          <div className="flex items-center p-4">
            <div className="flex-shrink-0 mr-4">
              {menuItem.dish.images && menuItem.dish.images.length > 0 ? (
                <img
                  src={menuItem.dish.images[0].link || "/placeholder.svg"}
                  alt={menuItem.dish.name}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-medium">{menuItem.dish.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{menuItem.dish.description}</p>
              <p className="font-bold text-green-600 mt-1">${menuItem.price.toFixed(2)}</p>
            </div>

            <Button size="sm" className="ml-4" onClick={() => onAddItem(menuItem)}>
              <PlusCircle className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

const MenuPage = () => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [showOrderPanel, setShowOrderPanel] = useState(false);

  // Track the order items (dishId and quantity)
    const [orderItems, setOrderItems] = useState<{ dishId: number; quantity: number; name: string; image: string; price : number }[]>([]);

  // Fetch menus data
  const { data: menusData, isLoading: isMenusLoading, isError: isMenusError } = useGetMenusQuery();

  // Handle adding items to the order (set default quantity as 1)
   const handleAddItem = (menuItem: MenuItem) => {
    setOrderItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.dishId === menuItem.dish.id);

      if (existingItemIndex >= 0) {
        // Item exists, increase quantity by 1
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        // Item doesn't exist, add new item with quantity 1 and additional dish details
        return [
          ...prevItems,
          {
            dishId: menuItem.dish.id,
            quantity: 1,
            name: menuItem.dish.name,
            image: menuItem.dish.images?.[0]?.link || '/placeholder.svg',
            price: menuItem.price,
          },
        ];
      }
    });

    setShowOrderPanel(true); // Show order panel after adding item
  };

  // Handle removing items from the order
  const handleRemoveItem = (dishId: number) => {
    setOrderItems((prevItems) => prevItems.filter((item) => item.dishId !== dishId));

    // If no items are left, hide the order panel
    if (orderItems.length <= 1) {
      setShowOrderPanel(false);
    }
  };

  // Handle updating the quantity of an item
  const handleUpdateQuantity = (dishId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(dishId);
      return;
    }

    setOrderItems((prevItems) =>
      prevItems.map((item) => (item.dishId === dishId ? { ...item, quantity: newQuantity } : item)),
    );
  };

  // Calculate the subtotal (sum of prices * quantity)
 
  if (isMenusLoading) return <div>Loading...</div>;
  if (isMenusError) return <div>Error loading menus</div>;

  return (
    <div className="flex h-full">
      {/* Menu Selection and Items */}
      <div className={`flex-1 p-4 ${showOrderPanel ? 'w-2/3' : 'w-full'}`}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Menu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <Accordion
                type="single"
                collapsible
                // value={expandedMenu}
                onValueChange={setExpandedMenu}
                className="w-full"
              >
                {menusData && menusData.data.length > 0 ? (
                  menusData.data.map((menu: Menu) => (
                    <AccordionItem key={menu.id} value={menu.id.toString()}>
                      <AccordionTrigger className="hover:no-underline">
                        <Badge variant="outline" className="px-4 py-2 text-base font-medium">
                          {menu.name}
                        </Badge>
                      </AccordionTrigger>
                      <AccordionContent>
                        <MenuItemsList menuId={menu.id} onAddItem={handleAddItem} />
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <p>No menus available.</p>
                )}
              </Accordion>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setShowOrderPanel(true)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              View Order
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Order Panel */}
      {showOrderPanel && (
        <div className="w-1/3 p-4">
          <OrderPanel
                      orderItems={orderItems}
                      onRemoveItem={handleRemoveItem}
                      onUpdateQuantity={handleUpdateQuantity}
                      onClose={() => setShowOrderPanel(false)}
                     menusData={[]}          />
        </div>
      )}
    </div>
  );
};

export default MenuPage;
