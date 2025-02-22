'use client';

import { useRouter } from 'next/navigation';
import FoodForm from '../_components/FoodForm';
import type { FoodItem } from '../_type';

export default function AddFoodPage() {
  const router = useRouter();

  // Xử lý lưu món ăn mới
  const handleSaveFood = async (newFood: Omit<FoodItem, 'id'>) => {
    try {
      const response = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFood),
      });

      if (!response.ok) {
        throw new Error('Không thể thêm món ăn');
      }

      console.log('Món ăn đã được thêm:', newFood);
      router.push('/food'); // Quay về trang danh sách
    } catch (error) {
      console.error('Lỗi khi thêm món ăn:', error);
    }
  };

  // Xử lý đóng form
  const handleClose = () => {
    router.push('/menu/food');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Thêm món ăn mới</h2>
      <FoodForm onClose={handleClose} onSave={handleSaveFood} />
    </div>
  );
}
