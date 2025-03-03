// app/(private)/menu/dish/components/DishManagement.tsx
'use client';

import React, { useState } from 'react';
import DishList from './DishList';
import DishForm from './DishForm';
import DishDeleteConfirm from './DishDeleteConfirm';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DishRequest } from '@/features/dish/types';
import { useGetAllDishesQuery } from '@/features/dish/dishApiSlice';

const DishManagement: React.FC = () => {
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);
  const [selectedDish, setSelectedDish] = useState<DishRequest | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: dishResponse } = useGetAllDishesQuery();
  const dishes = dishResponse?.data || [];

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

  return (
    <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
      <CardHeader className="bg-gray-100 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-black">Quản Lý Món Ăn</CardTitle>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button
                onClick={handleAddNew}
                className="bg-black text-white hover:bg-gray-800"
              >
                 Thêm món ăn
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-gray-200 shadow-md rounded-lg">
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
      </CardHeader>
      <CardContent>
        <DishList onEdit={handleEdit} onDelete={handleDelete} />
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="bg-white border border-gray-200 shadow-md rounded-lg">
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
      </CardContent>
    </Card>
  );
};

export default DishManagement;