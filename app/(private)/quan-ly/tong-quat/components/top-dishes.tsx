"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  useGetDishDetailsQuery, 
  useGetTopSellingDishesLastHourQuery 
} from '@/features/statistics/statisticsApiSlice';
import { Dish } from "@/features/statistics/types";

export default function TopDishes({ formatCurrency }: { formatCurrency: (amount: number) => string }) {
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

  if (isDishDetailsLoading || isTopHourlyDishesLoading) return <p className="p-4">Loading...</p>;
  if (dishDetailsError || topHourlyDishesError) return <p className="p-4 text-red-500">Đã có lỗi xảy ra.</p>;

  // Danh sách màu cho các thứ hạng
  const rankColors = ["bg-amber-500", "bg-slate-400", "bg-amber-700"];
  
  // Component hiển thị từng món ăn
  const DishItem = ({ dish, index }: { dish: Dish, index: number }) => (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4 flex items-center gap-3">
        <Badge className={`${rankColors[index] || "bg-green-500"} h-8 w-8 flex items-center justify-center text-white font-bold`}>
          {index + 1}
        </Badge>
        <div className="flex-1 overflow-hidden">
          <h3 className="font-bold truncate">{dish.dishName}</h3>
          <div className="flex justify-between mt-1 text-sm">
            <span className="text-muted-foreground">{dish.totalQuantity} món</span>
            <span className="font-medium">{formatCurrency(dish.dishPrice * dish.totalQuantity)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Component hiển thị danh sách các món ăn theo loại
  const DishSection = ({ title, dishes }: { title: string, dishes: Dish[] }) => (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {dishes.slice(0, 3).map((dish, index) => (
          <DishItem key={dish.dishId} dish={dish} index={index} />
        ))}
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