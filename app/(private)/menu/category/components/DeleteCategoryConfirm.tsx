import { useDeleteCategoryMutation } from '@/features/category/categoryApiSlice';
import { Category } from '@/features/category/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface DeleteCategoryConfirmProps {
  category: Category;
  onClose: () => void;
}

export default function DeleteCategoryConfirm({
  category,
  onClose,
}: DeleteCategoryConfirmProps) {
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleDelete = async () => {
    onClose();
    try {
      await deleteCategory(category.id).unwrap();
      toast.success('Xóa danh mục thành công');
    } catch (err: any) {
      let errorMessage = 'Không thể xóa danh mục. ';
      if (err?.data?.message) {
        errorMessage += err.data.message;
      } else {
        errorMessage += 'Vui lòng thử lại sau.';
      }
      toast.error(errorMessage);
    }
  };

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa danh mục "{category.name}"? 
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 