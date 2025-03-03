// app/(private)/menu/dish/components/DishList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useGetAllDishesQuery } from '@/features/dish/dishApiSlice';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { CalendarIcon, InfoIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { MdDeleteOutline } from "react-icons/md";
import { GrUpdate } from "react-icons/gr";
import { IoAddCircleSharp } from "react-icons/io5";

export interface DishListProps {
  onEdit: (id: number, dish: any) => void;
  onDelete: (id: number) => void;
  dishes?: any[];
  searchTerm?: string;
}

const DishList: React.FC<DishListProps> = ({ onEdit, onDelete, dishes: propDishes, searchTerm = "" }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: dishResponse, isLoading, error } = useGetAllDishesQuery();
  
  // If dishes are provided as props, use them; otherwise, use the query result
  const dishes = propDishes || dishResponse?.data || [];

  if (!isMounted) return null;
  if (isLoading && !propDishes)
    return (
      <div className="flex items-center justify-center h-40 w-full">
        <div className="text-gray-500 font-medium">Đang tải danh sách món ăn...</div>
      </div>
    );
  if (error && !propDishes)
    return (
      <div className="p-6 rounded-lg bg-gray-50 border border-gray-200">
        <div className="text-red-500 text-center">Lỗi khi tải danh sách: {JSON.stringify(error)}</div>
      </div>
    );

  // Filter dishes based on search term if provided
  const filteredDishes = searchTerm 
    ? dishes.filter((dish: any) => 
        dish.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        dish.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : dishes;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDishes.map((dish) => (
          <Card
            key={dish.id}
            className="overflow-hidden border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full"
          >
            <div className="relative h-52 w-full bg-gray-100 overflow-hidden group">
              {dish.images && dish.images.length > 0 ? (
                <Image
                  src={dish.images[0].link || '/images/placeholder-image.jpg'}
                  alt={dish.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                  priority={true}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-gray-200">
                  <InfoIcon className="h-12 w-12 text-gray-400" />
                  <span className="sr-only">Không có ảnh</span>
                </div>
              )}
            </div>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xl font-semibold text-gray-900 line-clamp-1">
                {dish.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
              <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
                {dish.description || 'Không có mô tả'}
              </p>
              <div className="flex items-center">
                <span className="font-bold text-lg text-black">
                  {dish.price.toLocaleString('vi-VN')} VND
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-gray-500 pt-2">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>Tạo: {new Date(dish.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>Cập nhật: {new Date(dish.updatedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 pt-3 pb-4 border-t border-gray-200">
              <Button
                onClick={() => onEdit(dish.id, dish)}
                className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                size="sm"
              >
                <GrUpdate className="text-xl text-white" />
                Sửa
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(dish.id)}
              >
                <MdDeleteOutline className="mr-1" />
                Xóa
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {filteredDishes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-lg border border-gray-200">
          <InfoIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium text-lg">
            {searchTerm ? "Không tìm thấy món ăn nào phù hợp" : "Không có món ăn nào trong danh sách"}
          </p>
        </div>
      )}
    </div>
  );
};

export default DishList;