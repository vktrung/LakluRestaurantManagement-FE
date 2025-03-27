'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDeleteCategoryMutation } from '@/features/category/categoryApiSlice';
import { Category } from '@/features/category/types';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationProps {
  category: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmation({
  category,
  onSuccess,
  onCancel,
}: DeleteConfirmationProps) {
  const [deleteCategory, { isLoading }] = useDeleteCategoryMutation();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      await deleteCategory(category.id).unwrap();
      onSuccess();
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError('Đã xảy ra lỗi khi xóa danh mục. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-amber-600">
        <AlertTriangle className="h-8 w-8" />
        <span className="text-lg font-medium">Xác nhận xóa</span>
      </div>

      <p className="text-gray-600">
        Bạn có chắc chắn muốn xóa danh mục{' '}
        <span className="font-semibold">"{category.name}"</span>? Hành động này
        không thể hoàn tác.
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="border-gray-300"
        >
          Hủy
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? 'Đang xóa...' : 'Xóa'}
        </Button>
      </div>
    </div>
  );
}
