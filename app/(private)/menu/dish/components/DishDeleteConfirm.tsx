// app/(private)/menu/dish/components/DishDeleteConfirm.tsx
'use client';

import React from 'react';
import { useDeleteDishMutation } from '@/features/dish/dishApiSlice'; // Adjust the import path
import { Button } from '@/components/ui/button'; // Adjust import path

interface DishDeleteConfirmProps {
  dishId: number; // Keep as required number (not optional or null)
  onConfirm: () => void;
  onCancel: () => void;
}

const DishDeleteConfirm: React.FC<DishDeleteConfirmProps> = ({ dishId, onConfirm, onCancel }) => {
  const [deleteDish] = useDeleteDishMutation();

  const handleDelete = async () => {
    try {
      await deleteDish(dishId).unwrap();
      onConfirm();
    } catch (error) {
      console.error('Failed to delete dish:', error);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-500">Bạn có chắc chắn muốn xóa danh mục có ID {dishId}?</p>
      <div className="flex space-x-2">
        <Button
          onClick={handleDelete}
          className="bg-black text-white hover:bg-gray-800"
        >
          Vâng, Xóa
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="bg-white text-black border-gray-300 hover:bg-gray-100"
        >
          Hủy
        </Button>
      </div>
    </div>
  );
};

export default DishDeleteConfirm;