// app/(private)/menu/dish/components/DishManagement.tsx
'use client';

import React, { useState } from 'react';
import DishList from './DishList';
import DishForm from './DishForm';
import DishDeleteConfirm from './DishDeleteConfirm';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DishRequest } from '@/features/dish/types';
import { useGetAllDishesQuery } from '@/features/dish/dishApiSlice';
import { IoAddCircleSharp } from "react-icons/io5";
import { Separator } from '@/components/ui/separator';

const DishManagement: React.FC = () => {
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);
  const [selectedDish, setSelectedDish] = useState<DishRequest | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: dishResponse, isLoading, error } = useGetAllDishesQuery();
  const dishes = dishResponse?.data || [];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (dishId: number, dish: any) => {
    console.log('Dish received for edit:', dish);
    const dishToEdit = dishes.find((d: any) => d.id === dishId) || dish;
    if (dishToEdit) {
      setSelectedDish({
        name: dishToEdit.name,
        description: dishToEdit.description || '',
        price: dishToEdit.price,
        imageIds: dishToEdit.images?.map((img: any) => img.id) || [],
      });
      setSelectedDishId(dishId);
      setShowForm(true);
    }
  };

  const handleDelete = (dishId: number) => {
    setSelectedDishId(dishId);
    setShowDeleteConfirm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedDishId(null);
    setSelectedDish(undefined);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setSelectedDishId(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setSelectedDishId(null);
  };

  const handleAddNew = () => {
    setSelectedDishId(null); 
    setSelectedDish(undefined);
    setShowForm(true); 
  };

  // Filter dishes based on search term
  const filteredDishes = dishes.filter((dish: any) =>
    dish.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dish.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-40 w-full">
        <div className="text-gray-500 font-medium">Đang tải danh sách món ăn...</div>
      </div>
    );
  if (error)
    return (
      <div className="p-6 rounded-lg bg-gray-50 border border-gray-200">
        <div className="text-red-500 text-center">Lỗi khi tải danh sách: {JSON.stringify(error)}</div>
      </div>
    );

  return (
    <div className="space-y-4 w-full ">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Danh Sách Món Ăn</h2>
        <Separator className="mt-4 bg-gray-200" />
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 w-full max-w-md">
          <Input
            placeholder="Tìm kiếm món ăn..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border-gray-300 focus:border-black focus:ring-black"
          />
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
            >
              <IoAddCircleSharp className="text-xl" />
              <span>Thêm món ăn</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-black">
                {selectedDishId ? 'Sửa Món ăn' : 'Thêm Món ăn Mới'}
              </DialogTitle>
            </DialogHeader>
            <DishForm
              dishId={selectedDishId || undefined}
              onClose={handleFormClose}
              existingDish={selectedDish}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <DishList 
        dishes={filteredDishes} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        searchTerm={searchTerm}
      />
      
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-black">Xác Nhận Xóa</DialogTitle>
          </DialogHeader>
          {selectedDishId && (
            <DishDeleteConfirm
              dishId={selectedDishId}
              onConfirm={handleDeleteConfirm}
              onCancel={handleDeleteCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DishManagement;