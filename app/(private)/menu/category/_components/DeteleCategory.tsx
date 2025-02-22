'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface DeleteCategoryProps {
  categoryId: number;
  onDelete: (categoryId: number) => void; // Callback to notify the parent component
  onClose: () => void; // Callback to close the modal
}

const DeleteCategory = ({ categoryId, onDelete, onClose }: DeleteCategoryProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDelete = async () => {
    console.log(`Deleting category with ID: ${categoryId}`);
    
    // Call the onDelete callback to notify the parent component about the deletion
    onDelete(categoryId);
    onClose(); // Close the modal after deletion
  };

  const handleCancel = () => {
    setIsConfirming(false); // Close the confirmation dialog
    onClose(); // Close the modal if the user cancels
  };

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 z-50 flex items-center justify-center">
        <Card className="p-6 w-96 shadow-lg bg-white relative">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Xoá danh mục</h1>
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={handleCancel}
            >
              &times;
            </button>
          </div>

          {!isConfirming ? (
            <div className="flex justify-center items-center">
              <Button
                variant="destructive"
                onClick={() => setIsConfirming(true)}
                className="flex items-center gap-2"
              >
                <Trash className="h-5 w-5" />
                Xoá danh mục
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg">Bạn chắc chắn muốn xoá danh mục này?</p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleCancel}>
                  Huỷ
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Xoá
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default DeleteCategory;
