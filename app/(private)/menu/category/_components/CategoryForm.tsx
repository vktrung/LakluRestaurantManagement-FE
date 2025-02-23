'use client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface CategoryFormProps {
  category?: { id: number; name: string; image: string }; // Optional category for editing
  onClose: () => void;
  onSave: (category: { id?: number; name: string; image: string }) => void;
}

export default function CategoryForm({ category, onClose, onSave }: CategoryFormProps) {
  const [newCategory, setNewCategory] = useState({ name: '', image: '' });

  useEffect(() => {
    if (category) {
      setNewCategory({ name: category.name, image: category.image });
    }
  }, [category]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="p-6 bg-white w-96">
        <h2 className="text-xl font-bold mb-4">
          {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
        </h2>
        <Input
          placeholder="Tên danh mục"
          value={newCategory.name}
          onChange={(e) =>
            setNewCategory({ ...newCategory, name: e.target.value })
          }
          className="mb-4"
        />
        <Input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setNewCategory({
                ...newCategory,
                image: URL.createObjectURL(file),
              });
            }
          }}
          className="mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              onSave(newCategory); 
              onClose();
            }}
          >
            <Plus className="h-4 w-4" /> Lưu
          </Button>
        </div>
      </Card>
    </div>
  );
}
