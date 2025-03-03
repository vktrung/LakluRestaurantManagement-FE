'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = 'mục này',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
        <h2 className="text-lg font-semibold mb-4">Xác nhận xóa</h2>
        <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa <strong>{itemName}</strong> không?</p>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            className="bg-red-600 text-white hover:bg-red-700 transition"
            onClick={onConfirm}
          >
            Xóa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
