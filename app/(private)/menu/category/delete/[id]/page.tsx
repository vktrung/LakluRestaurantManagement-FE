'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useDeleteCategoryMutation } from '@/features/category/categoryApiSlice';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function DeleteCategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();

  const categoryId = Number(id);
  const categoryName = searchParams.get('name') || 'Unknown Category';


  const [deleteCategory, { isLoading: isDeleting, isError: deleteError }] = useDeleteCategoryMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(true); 

  useEffect(() => {
    if (!categoryId) {
      router.push('/menu/category'); 
    }
  }, [categoryId, router]);

  const handleDelete = async () => {
    try {
      await deleteCategory(categoryId).unwrap();
      router.push('/menu/category'); // Redirect after deletion
    } catch (err) {
      console.error('❌ Failed to delete category:', err);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => !open && router.push('/menu/category')}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the category <strong>"{categoryName}"</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => router.push('/menu/category')}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
      {deleteError && <p className="text-red-500 text-sm text-center mt-2">❌ Failed to delete category</p>}
    </Dialog>
  );
}
