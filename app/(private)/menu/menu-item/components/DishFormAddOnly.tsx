'use client';

import React, { useState } from 'react';
import { useCreateDishMutation } from '@/features/dish/dishApiSlice';
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
import { Heading1, Upload } from 'lucide-react';

interface DishFormAddOnlyProps {
  onClose?: () => void; // Only for Add mode
}

const DishFormAddOnly: React.FC<DishFormAddOnlyProps> = ({ onClose }) => {
 
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [imageIds, setImageIds] = useState<number[]>([]);

  const [createDish] = useCreateDishMutation();
  const [uploadFile] = useUploadFileMutation();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadFile(formData).unwrap();
      const imageId = response.data.id;
      setImageIds(prev => [...prev, imageId]);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dishData: DishRequest = { name, description, imageIds, price };


    try {
      await createDish(dishData).unwrap();
      setName('');
      setDescription('');
      setPrice(0);
      setImageIds([]);
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to save dish:', error);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-semibold text-gray-900">
          Thêm Món Ăn
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-semibold text-gray-700"
            >
              Tên Món Ăn
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nhập tên món ăn"
              className="rounded-lg border-gray-200 focus:ring-2 focus:ring-gray-500 text-gray-900 placeholder-gray-400"
              required
            />
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
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="price"
              className="text-sm font-semibold text-gray-700"
            >
              Giá (VND)
            </Label>
            <Input
              id="price"
              type="number"
              value={price === 0 ? '' : price}
              onChange={e => setPrice(Number(e.target.value) || 0)}
              placeholder="Nhập giá món ăn"
              className="rounded-lg border-gray-200 focus:ring-2 focus:ring-gray-500 text-gray-900 placeholder-gray-400"
              required
            />
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
                />
              </label>
            </div>
            {imageIds.length > 0 && (
              <p className="text-xs text-gray-500">
                Đã chọn {imageIds.length} hình ảnh (IDs: {imageIds.join(', ')})
              </p>
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
            >
              Hủy
            </Button>
          )}
          <Button
            type="submit"
            className="rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            Tạo Mới
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default DishFormAddOnly;
