'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '@/features/category/categoryApiSlice';
import { Category, CategoryRequest } from '@/features/category/types';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CategoryFormProps {
  category?: Category;
  isEdit?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CategoryForm({
  category,
  isEdit = false,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({ name: '' });
  const [apiError, setApiError] = useState<string | null>(null);

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (category && isEdit) {
      setName(category.name);
      setDescription(category.description || '');
    }
  }, [category, isEdit]);

  const validateForm = () => {
    const newErrors = { name: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Tên danh mục không được để trống';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    const categoryData: CategoryRequest = {
      name,
      description,
    };

    try {
      if (isEdit && category) {
        await updateCategory({ id: category.id, body: categoryData }).unwrap();
      } else {
        await createCategory(categoryData).unwrap();
      }
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save category:', error);

      // Handle API error response
      if (error?.data) {
        const { data, message, httpStatus, error: errorCode } = error.data;

        if (httpStatus === 400) {
          if (message) {
            setApiError(message);
          } else {
            setApiError(
              'Dữ liệu không hợp lệ. Vui lòng kiểm tra thông tin nhập vào.',
            );
          }
        } else if (httpStatus === 409) {
          setApiError('Tên danh mục đã tồn tại. Vui lòng sử dụng tên khác.');
        } else if (message) {
          setApiError(message);
        } else {
          setApiError('Đã xảy ra lỗi khi lưu danh mục. Vui lòng thử lại sau.');
        }
      } else {
        setApiError(
          'Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại sau.',
        );
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
          Tên Danh Mục <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nhập tên danh mục"
          className="rounded-lg border-gray-200 focus:ring-2 focus:ring-gray-500"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-sm font-semibold text-gray-700"
        >
          Mô Tả
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Mô tả danh mục"
          className="rounded-lg border-gray-200 focus:ring-2 focus:ring-gray-500 min-h-[100px]"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? 'Đang xử lý...' : isEdit ? 'Cập Nhật' : 'Thêm Mới'}
        </Button>
      </div>
    </form>
  );
}
