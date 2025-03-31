'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDeleteCategoryMutation } from '@/features/category/categoryApiSlice';
import { Category } from '@/features/category/types';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDelete = async () => {
    setApiError(null);

    try {
      await deleteCategory(category.id).unwrap();
      onSuccess();
    } catch (err: any) {
      console.error('Failed to delete category:', err);

      // Handle API error response
      if (err?.data) {
        const { data, message, httpStatus, error: errorCode } = err.data;

        if (httpStatus === 400) {
          if (message) {
            setApiError(message);
          } else {
            setApiError('Không thể xóa danh mục này. Vui lòng kiểm tra lại.');
          }
        } else if (httpStatus === 409) {
          setApiError('Danh mục này đang được sử dụng. Không thể xóa.');
        } else if (message) {
          setApiError(message);
        } else {
          setApiError('Đã xảy ra lỗi khi xóa danh mục. Vui lòng thử lại sau.');
        }
      } else {
        setApiError(
          'Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại sau.',
        );
      }
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

      {apiError && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
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
