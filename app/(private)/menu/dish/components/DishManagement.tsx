// app/(private)/menu/dish/components/DishManagement.tsx
'use client';

import React, { useState, ChangeEvent } from 'react';
import DishList from './DishList';
import DishForm from './DishForm';
import DishDeleteConfirm from './DishDeleteConfirm';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DishRequest } from '@/features/dish/types';
import { useGetPagedDishesQuery } from '@/features/dish/dishApiSlice';
import { IoAddCircleSharp } from 'react-icons/io5';
import { Separator } from '@/components/ui/separator';

const DishManagement: React.FC = () => {
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);
  const [selectedDish, setSelectedDish] = useState<DishRequest | undefined>(
    undefined,
  );
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // We don't need to fetch dishes here anymore since DishList will handle pagination
  // The filtered dish logic is also moved to DishList

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (dishId: number, dish: any) => {
    console.log('Dish received for edit:', dish);
    if (dish) {
      setSelectedDish({
        name: dish.name,
        description: dish.description || '',
        price: dish.price,
        imageIds: dish.images?.map((img: any) => img.id) || [],
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
