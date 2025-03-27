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
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
