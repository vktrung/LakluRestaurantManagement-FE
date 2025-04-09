// app/(private)/menu/dish/components/DishForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  useCreateDishMutation,
  useUpdateDishMutation,
} from '@/features/dish/dishApiSlice';
import { DishRequest } from '@/features/dish/types';
import { useUploadFileMutation } from '@/features/file-attachment/fileAttachmentApiSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DishFormProps {
  dishId?: number | null;
  onClose?: () => void;
  existingDish?: DishRequest;
}

const DishForm: React.FC<DishFormProps> = ({
  dishId,
  onClose,
  existingDish,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [imageIds, setImageIds] = useState<number[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState({
    name: '',
    price: '',
    imageIds: '',
  });

  const [createDish, { isLoading: isCreating }] = useCreateDishMutation();
  const [updateDish, { isLoading: isUpdating }] = useUpdateDishMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const isLoading = isCreating || isUpdating || isUploading;

  useEffect(() => {
    console.log('existingDish received:', existingDish);
    if (existingDish) {
      setName(existingDish.name || '');
      setDescription(existingDish.description || '');
      setPrice(existingDish.price || 0);
    } else {
      setName('');
      setDescription('');
      setPrice(0);
      setImageIds([]);
    }
  }, [existingDish, dishId]);

  const validateForm = () => {
    const errors = {
      name: '',
      price: '',
      imageIds: '',
    };
    let isValid = true;

    if (!name.trim()) {
      errors.name = 'Tên món ăn không được để trống';
      isValid = false;
    }

    if (!price || price <= 0) {
      errors.price = 'Giá món ăn phải lớn hơn 0';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadFile(formData).unwrap();
      const imageId = response.data.id;
      setImageIds(prev => [...prev, imageId]);
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      if (error?.data) {
        const { message, httpStatus } = error.data;
        if (message) {
          setApiError(`Lỗi khi tải ảnh lên: ${message}`);
        } else {
          setApiError('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
        }
      } else {
        setApiError('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) return;

    const dishData: DishRequest = { name, description, imageIds, price };

    console.log('Submitting dish data:', dishData);

    try {
      if (dishId && dishId > 0) {
        await updateDish({ id: dishId, body: dishData }).unwrap();
      } else {
        await createDish(dishData).unwrap();
      }
      setName('');
      setDescription('');
      setPrice(0);
      setImageIds([]);
      if (onClose) onClose();
    } catch (error: any) {
      console.error('Failed to save dish:', error);
      
      // Handle API error response
      if (error?.data) {
        const { message, httpStatus, error: errorCode } = error.data;
        
        if (httpStatus === 400) {
          if (message) {
            setApiError(message);
          } else {
            setApiError('Dữ liệu không hợp lệ. Vui lòng kiểm tra thông tin món ăn.');
          }
        } else if (httpStatus === 409) {
          setApiError('Món ăn này đã tồn tại. Vui lòng sử dụng tên khác.');
        } else if (message) {
          setApiError(message);
        } else {
          setApiError('Đã xảy ra lỗi khi lưu món ăn. Vui lòng thử lại sau.');
        }
      } else {
        setApiError('Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto border-none shadow-md">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-semibold text-gray-700"
            >
              Tên Món Ăn <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nhập tên món ăn"
              className="rounded-lg border-gray-200 focus:ring-2 focus:ring-gray-500 text-gray-900 placeholder-gray-400"
              disabled={isLoading}
              required
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
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
              placeholder="Mô tả món ăn của bạn"
              className="rounded-lg border-gray-200 focus:ring-2 focus:ring-gray-500 text-gray-900 placeholder-gray-400 min-h-[120px]"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="price"
              className="text-sm font-semibold text-gray-700"
            >
              Giá (VND) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              value={price === 0 ? '' : price}
              onChange={e => setPrice(Number(e.target.value) || 0)}
              placeholder="Nhập giá món ăn"
              className="rounded-lg border-gray-200 focus:ring-2 focus:ring-gray-500 text-gray-900 placeholder-gray-400"
              disabled={isLoading}
              required
            />
            {formErrors.price && (
              <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="image"
              className="text-sm font-semibold text-gray-700"
            >
              Hình Ảnh
            </Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Kéo thả hoặc nhấp để tải ảnh lên
                  </p>
                </div>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>
            {imageIds.length > 0 && (
              <p className="text-xs text-gray-500">
                Đã chọn {imageIds.length} hình ảnh (IDs: {imageIds.join(', ')})
              </p>
            )}
            {formErrors.imageIds && (
              <p className="text-red-500 text-xs mt-1">{formErrors.imageIds}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3 pt-6">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
          )}
          <Button
            type="submit"
            className="rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            disabled={isLoading}
          >
            {isLoading 
              ? 'Đang xử lý...' 
              : dishId && dishId > 0 
                ? 'Cập Nhật' 
                : 'Tạo Mới'
            }
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default DishForm;
