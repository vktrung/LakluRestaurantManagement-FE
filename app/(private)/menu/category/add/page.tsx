'use client';
import { useState } from 'react';
import CategoryForm from '../_components/CategoryForm';

export default function Page() {
  const [isAdding, setIsAdding] = useState(true);

  const handleSaveCategory = (newCategory: { name: string; image: string }) => {
    console.log('Lưu danh mục:', newCategory);
    window.location.href = '/menu/category';
  };

  const handleClose = () => {
    window.location.href = '/menu/category';
  };

  return (
    <>
      {isAdding && (
        <CategoryForm onClose={handleClose} onSave={handleSaveCategory} />
      )}
    </>
  );
}
