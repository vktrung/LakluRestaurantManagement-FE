'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import {
  Coffee,
  UtensilsCrossed,
  IceCream,
  Trash,
  Plus,
  Edit,
} from 'lucide-react';
import DeleteCategory from './_components/DeteleCategory';
import EditCategoryPopup from './_components/EditCategoryPopup';


const categories = [
  { id: 1, name: 'Đồ uống', itemCount: 12, icon: Coffee },
  { id: 2, name: 'Món chính', itemCount: 8, icon: UtensilsCrossed },
  { id: 3, name: 'Tráng miệng', itemCount: 5, icon: IceCream },
];

export default function CategoryManage() {
  const [categoriesList, setCategoriesList] = useState(categories);
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [editCategory, setEditCategory] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const handleDeleteClick = (id: number) => {
    setDeleteCategoryId(id);
  };

  const handleEditClick = (category: { id: number; name: string }) => {
    setEditCategory(category);
  };

  const handleCategoryDelete = (categoryId: number) => {
    setCategoriesList((prevCategories) =>
      prevCategories.filter((category) => category.id !== categoryId)
    );
    setDeleteCategoryId(null);
  };

  return (
    <Card className="p-8 w-full h-full shadow-lg bg-white">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Quản lý danh mục
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesList.map((category) => {
          const Icon = category.icon;
          return (
            <Card
            key={category.id}
            className="group relative p-6 cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-between w-full h-[220px] bg-white rounded-lg border border-gray-300"
          >
            <Icon className="h-10 w-10 text-gray-700 mb-4" />
            <h2 className="text-xl font-semibold text-center text-gray-900">
              {category.name}
            </h2>
            <p className="text-sm text-gray-600">{category.itemCount} món</p>
          
            {/* Edit & Delete Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleEditClick(category)}
                className="p-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-all shadow-md"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDeleteClick(category.id)}
                className="p-3 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-all shadow-md"
              >
                <Trash className="h-5 w-5" />
              </button>
            </div>
          </Card>
          
          );
        })}
      </div>

      {/* Delete Category Popup */}
      {deleteCategoryId !== null && (
        <DeleteCategory
          categoryId={deleteCategoryId}
          onDelete={handleCategoryDelete}
          onClose={() => setDeleteCategoryId(null)}
        />
      )}

      {/* Edit Category Popup */}
      {editCategory && (
        <EditCategoryPopup
          category={editCategory}
          onClose={() => setEditCategory(null)}
          onSave={(updatedCategory) => {
            setCategoriesList((prev) =>
              prev.map((cat) =>
                cat.id === updatedCategory.id
                  ? { ...cat, name: updatedCategory.name }
                  : cat
              )
            );
            setEditCategory(null);
          }}
        />
      )}

      {/* Add Category Button */}
      <div className="mt-8 flex justify-center">
        <Link href="/menu/category/add">
          <Card className="group p-4 cursor-pointer hover:shadow-xl transition-all duration-300 border-dashed border-2 border-gray-500 hover:border-gray-700 hover:scale-105 w-[180px] h-[180px] flex flex-col justify-center items-center bg-gray-100 rounded-lg">
            <Plus className="h-8 w-8 mb-3 text-gray-600 group-hover:text-gray-800 transition-colors" />
            <p className="text-base font-semibold text-center text-gray-700 group-hover:text-gray-900 transition-colors">
              Thêm danh mục
            </p>
          </Card>
        </Link>
      </div>
    </Card>
  );
}
