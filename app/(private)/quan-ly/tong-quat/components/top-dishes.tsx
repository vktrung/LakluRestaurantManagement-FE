"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetTopSellingDishesQuery } from '@/features/statistics/statisticsApiSlice';
import { Dish } from "@/features/statistics/types";

export default function TopDishes({ formatCurrency }: { formatCurrency: (amount: number) => string }) {
  // Lấy dữ liệu từ API top-selling-dishes
  const { data, isLoading, error } = useGetTopSellingDishesQuery();
  const topDishes: Dish[] = data?.data || [];

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Đã có lỗi xảy ra.</p>;

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-2xl font-bold">Top 3 Món Ăn Bán Chạy Nhất</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {topDishes.slice(0, 3).map((dish, index) => (
          <Card key={dish.dishId}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">{dish.dishName}</h2>
                <Badge className="bg-green-500">{index + 1}</Badge> {/* Sử dụng Badge để hiển thị thứ hạng */}
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <p className="text-sm text-muted-foreground">Số lượng: {dish.totalQuantity}</p>
              </div>
              <p className="text-sm font-medium">
                {formatCurrency(dish.dishPrice * dish.totalQuantity)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}