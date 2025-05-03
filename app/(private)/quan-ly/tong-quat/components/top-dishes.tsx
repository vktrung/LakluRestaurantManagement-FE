"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  useGetDishDetailsQuery, 
  useGetTopSellingDishesLastHourQuery 
} from '@/features/statistics/statisticsApiSlice';
import { Dish } from "@/features/statistics/types";

export default function TopDishes({ formatCurrency }: { formatCurrency: (amount: number) => string }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lấy dữ liệu từ API dishes/evening-to-morning/details
  const { 
    data: dishDetailsData, 
    isLoading: isDishDetailsLoading, 
    error: dishDetailsError 
  } = useGetDishDetailsQuery();
  
  // Lấy dữ liệu từ API top-selling-dishes/last-hour
  const { 
    data: topHourlyDishesData, 
    isLoading: isTopHourlyDishesLoading, 
    error: topHourlyDishesError 
  } = useGetTopSellingDishesLastHourQuery();
  
  // Xử lý và sắp xếp dữ liệu để lấy top món bán chạy trong ngày
  const dishes: Dish[] = dishDetailsData?.data || [];
  const dailyDishes = [...dishes].sort((a, b) => b.totalQuantity - a.totalQuantity);
  
  const topHourlyDishes: Dish[] = topHourlyDishesData?.data || [];

  if (isDishDetailsLoading || isTopHourlyDishesLoading) 
    return (
      <div className="flex items-center justify-center p-4 h-[200px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          <div className="text-xs text-muted-foreground">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  
  if (dishDetailsError || topHourlyDishesError) 
    return (
      <div className="p-4 text-red-500 text-center">
        <div className="text-sm">Đã có lỗi xảy ra khi tải dữ liệu.</div>
        <div className="text-xs mt-1">Vui lòng thử lại sau.</div>
      </div>
    );

  // Danh sách màu cho các thứ hạng
  const rankColors = [
    "bg-gradient-to-r from-yellow-400 to-amber-500", 
    "bg-gradient-to-r from-gray-300 to-slate-400", 
    "bg-gradient-to-r from-amber-600 to-amber-700"
  ];
  
  // Component hiển thị từng món ăn
  const DishItem = ({ dish, index }: { dish: Dish, index: number }) => (
    <Card className="overflow-hidden border border-muted/30 shadow-sm hover:shadow-md transition-all duration-300 group">
      <CardContent className="p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
        <Badge className={`${rankColors[index] || "bg-gradient-to-r from-green-400 to-green-500"} h-5 w-5 sm:h-7 sm:w-7 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs rounded-full transition-transform group-hover:scale-110`}>
          {index + 1}
        </Badge>
        <div className="flex-1 overflow-hidden">
          <h3 className="font-medium text-xs sm:text-sm truncate group-hover:text-primary transition-colors">{dish.dishName}</h3>
          <div className="flex justify-between mt-1 text-[10px] sm:text-xs">
            <span className="text-muted-foreground">{dish.totalQuantity} món</span>
            <span className="font-medium">{formatCurrency(dish.dishPrice * dish.totalQuantity)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Component hiển thị danh sách các món ăn theo loại
  const DishSection = ({ title, dishes }: { title: string, dishes: Dish[] }) => (
    <Card className="col-span-1 bg-gradient-to-br from-white to-gray-50 border-muted/50">
      <CardHeader className="pb-1 pt-2 px-3 sm:pb-2 sm:pt-4 sm:px-6">
        <CardTitle className="text-sm sm:text-base lg:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-2 sm:p-3 lg:p-6 pt-0 sm:pt-0">
        {isMounted && dishes.length > 0 ? (
          dishes.slice(0, 3).map((dish, index) => (
            <DishItem key={dish.dishId} dish={dish} index={index} />
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4 text-xs sm:text-sm flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.5 12h2.5l-3 5m-2-5h2.5m-7.5 5h7.5m-12.5-5h2.5m0 0l-3 5m7.5 0h-7.5" />
            </svg>
            Không có dữ liệu
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <DishSection title="Top Món Bán Chạy Trong Ngày" dishes={dailyDishes} />
      <DishSection title="Top Món Bán Chạy 1 Giờ Qua" dishes={topHourlyDishes} />
    </>
  );
}