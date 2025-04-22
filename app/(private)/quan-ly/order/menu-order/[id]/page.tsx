'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
// Đảm bảo import đúng các hooks từ menuApiSlice
import { menuApiSlice, useGetMenusQuery, useGetMenuDishesQuery } from '@/features/menu/menuApiSlice';
import { useGetCategoriesQuery } from '@/features/category/categoryApiSlice';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, ShoppingBag, ShoppingCart } from 'lucide-react';
import { MenuItem, Menu, Category, MenuStatus, MenuItemStatus } from '@/features/menu/types';
import OrderPanel from '../components/OrderPanel';

const MenuItemsList = ({
  menuId,
  selectedCategoryId,
  onAddItem,
}: {
  menuId: number;
  selectedCategoryId: number | null;
  onAddItem: (menuItem: MenuItem) => void;
}) => {
  const { data: menuDetailData, isLoading: isMenuDetailLoading, isError: isMenuDetailError } = useGetMenuDishesQuery({
    menuId,
    activeOnly: true,
    page: 0,
    size: 10,
  });

  if (isMenuDetailLoading) {
    return <div>Loading items...</div>;
  }

  if (isMenuDetailError || !menuDetailData?.data || menuDetailData.data.content.length === 0) {
    return <div>No items available in this menu.</div>;
  }

  // Filter menu items by selected category (if any) and ensure they are active
  const filteredItems = menuDetailData.data.content.filter(
    (menuItem: MenuItem) =>
      menuItem.status === MenuItemStatus.ENABLE &&
      (!selectedCategoryId || menuItem.categoryId === selectedCategoryId)
  );

  // Group items by category for display
  const itemsByCategory = filteredItems.reduce((acc, item) => {
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
          {items.map((menuItem: MenuItem) => (
            <Card key={menuItem.id} className="overflow-hidden mb-2">
              <div className="flex items-center p-4">
                <div className="flex-shrink-0 mr-4">
                  {menuItem.dish.images && menuItem.dish.images.length > 0 ? (
                    <img
                      src={menuItem.dish.images[0].link || '/placeholder.svg'}
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
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {menuItem.dish.description || 'No description available'}
                  </p>
                  <p className="font-bold text-green-600 mt-1">
                    {menuItem.price.toLocaleString('vi-VN')} VND
                  </p>
                </div>
                <Button size="sm" className="ml-4" onClick={() => onAddItem(menuItem)}>
                  <PlusCircle className="h-4 w-4 mr-1" /> Thêm
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ))}
      {filteredItems.length === 0 && <p>No items match the selected category.</p>}
    </div>
  );
};

const MenuPage = () => {
  const params = useParams();
  const reservationId = Number(params.id);

  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<
    { menuItemsId: number; dishId: number; quantity: number; name: string; image: string; price: number }[]
  >([]);

  // Fetch menus and categories data
  const { data: menusData, isLoading: isMenusLoading, isError: isMenusError } = useGetMenusQuery();
  const { data: categoriesData, isLoading: isCategoriesLoading, isError: isCategoriesError } = useGetCategoriesQuery();

  // Handle adding items to the order
  const handleAddItem = (menuItem: MenuItem) => {
    setOrderItems((prevItems) => {
      const updatedItems = [...prevItems];
      const existingItemIndex = updatedItems.findIndex((item) => item.dishId === menuItem.dishId);

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
        });
      }
      return updatedItems;
    });
    setShowOrderPanel(true);
  };

  // Handle removing items from the order
  const handleRemoveItem = (dishId: number) => {
    setOrderItems((prevItems) => prevItems.filter((item) => item.dishId !== dishId));
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

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value === 'all' ? null : Number(value));
  };

  if (isMenusLoading || isCategoriesLoading) return <div>Loading...</div>;
  if (isMenusError || isCategoriesError) return <div>Error loading data</div>;

  // Filter out deleted categories
  const activeCategories = categoriesData?.data.filter((category: Category) => !category.isDeleted) || [];

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
            {/* Category Filter */}
            <div className="mt-4">
              <Select onValueChange={handleCategoryChange} defaultValue="all">
                <SelectTrigger className="w-[200px]">
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
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
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
                          <Badge variant="outline" className="px-4 py-2 text-base font-medium">
                            {menu.name}
                          </Badge>
                        </AccordionTrigger>
                        <AccordionContent>
                          <MenuItemsList
                            menuId={menu.id}
                            selectedCategoryId={selectedCategoryId}
                            onAddItem={handleAddItem}
                          />
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
              Xem đơn hàng
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
            reservationId={reservationId}
            menusData={menusData?.data || []}
          />
        </div>
      )}
    </div>
  );
};

export default MenuPage;