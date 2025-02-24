'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetCategoriesQuery } from '@/features/category/categoryApiSlice';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Category } from '@/features/category/types';

export default function CategoryListPage() {
  console.log('Listcategory is rendering...');

  const [categories, setCategories] = useState<Category[]>([]);
  const {
    data: categoriesResponse,
    isLoading,
    isError,
  } = useGetCategoriesQuery();
  const router = useRouter();

  useEffect(() => {
    if (categoriesResponse?.data) {
      const filteredCategories = categoriesResponse.data.filter(
        category => category.isDeleted === false,
      ); 
      setCategories(filteredCategories);
      console.log('✅ Fetched and filtered categories:', filteredCategories);
    }
  }, [categoriesResponse]);

  if (isLoading) return <div className="container mx-auto p-6">Loading...</div>;
  if (isError)
    return (
      <div className="container mx-auto p-6">Error loading categories</div>
    );

  // ✅ Navigate to edit page with category data
  const handleEdit = (category: Category) => {
    router.push(
      `/menu/category/edit/${category.id}?name=${category.name}&description=${
        category.description || ''
      }`,
    );
  };

  // ✅ Navigate to delete page with category data
  const handleDelete = (category: Category) => {
    router.push(`/menu/category/delete/${category.id}?name=${category.name}`);
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="flex justify-between items-center bg-gradient-to-r from-indigo-100 to-purple-100">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Category Management
          </CardTitle>
          <Link href="./category/add">
            <Button variant="default" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Category
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.length > 0 ? (
              categories.map(category => (
                <Card
                  key={category.id}
                  className="p-4 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {category.name}
                      </h2>
                      <p className="text-gray-600 line-clamp-2">
                        {category.description || 'No description'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Tạo vào ngày:{' '}
                        {category.createdAt
                          ? new Date(category.createdAt).toLocaleDateString()
                          : 'Not available'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-gray-500 text-center">No categories found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
