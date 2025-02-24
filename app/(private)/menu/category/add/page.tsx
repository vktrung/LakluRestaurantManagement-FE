'use client';

import { useState } from 'react';
import { useCreateCategoryMutation } from '@/features/category/categoryApiSlice';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

export default function AddCategoryPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createCategory, { isLoading, isError, error }] =
    useCreateCategoryMutation();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({ name, description }).unwrap();
      router.push('/menu/category');

    } catch (err) {
      console.error('Failed to create category:', err);
    }
  };

  let errorMessage = 'Failed to create category';
  if (isError && error) {
    if (
      'data' in error &&
      typeof error.data === 'object' &&
      error.data !== null &&
      'message' in error.data
    ) {
      errorMessage =
        (error.data as { message: string }).message ||
        'Failed to create category';
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter category description"
                className="min-h-[100px]"
              />
            </div>

            <CardFooter className="flex justify-end space-x-2">
              <Button type="submit" disabled={isLoading} variant="default">
                {isLoading ? 'Creating...' : 'Add Category'}
              </Button>
            </CardFooter>

            {isError && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
