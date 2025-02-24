'use client';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useUpdateCategoryMutation } from '@/features/category/categoryApiSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const categoryId = Number(id);

  // ✅ Lấy dữ liệu category từ URL
  const searchParams = useSearchParams();
  const nameFromUrl = searchParams.get('name') || '';
  const descriptionFromUrl = searchParams.get('description') || '';


  const [name, setName] = useState(nameFromUrl);
  const [description, setDescription] = useState(descriptionFromUrl);

  const [updateCategory, { isLoading: isUpdating, isError: updateError }] = useUpdateCategoryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateCategory({
        id: categoryId,
        body: { name, description },
      }).unwrap();

      router.push('/menu/category');
    } catch (err) {
      console.error('❌ Failed to update category:', err);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Edit Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter category description"
                className="min-h-[100px]"
              />
            </div>
            <CardFooter className="flex justify-end space-x-2">
              <Button type="submit" disabled={isUpdating} variant="default">
                {isUpdating ? 'Updating...' : 'Update Category'}
              </Button>
              {updateError && (
                <p className="text-red-500 text-sm mt-2">
                  Failed to update category
                </p>
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
