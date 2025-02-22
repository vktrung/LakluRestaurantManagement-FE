'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EditCategoryPopupProps {
  category: { id: number; name: string };
  onClose: () => void;
  onSave: (category: { id: number; name: string }) => void;
}

export default function EditCategoryPopup({
  category,
  onClose,
  onSave,
}: EditCategoryPopupProps) {
  const [name, setName] = useState(category.name);

  const handleSave = () => {
    if (name.trim()) {
      onSave({ id: category.id, name });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Chỉnh sửa danh mục
        </h2>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 border-gray-400 text-gray-900"
        />
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleSave}
            className="bg-gray-800 text-white hover:bg-gray-700"
          >
            Lưu
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-500 text-gray-900 hover:bg-gray-200"
          >
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
}
