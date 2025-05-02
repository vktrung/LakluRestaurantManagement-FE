// DisableTableModal.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUpdateTableMutation } from '@/features/table/tableApiSlice';
import { ITable } from '@/features/table/type';
import { toast } from 'sonner';

interface DisableTableModalProps {
  open: boolean;
  onClose: () => void;
  table: ITable | null;
}

export default function DisableTableModal({ open, onClose, table }: DisableTableModalProps) {
  const [updateTable, { isLoading }] = useUpdateTableMutation();

  const handleDisable = async () => {
    if (!table) return;

    try {
      await updateTable({
        id: table.id,
        status: 'OCCUPIED',
      }).unwrap();
      toast.success(`Bàn ${table.tableNumber} đã được vô hiệu hóa!`, {
        position: 'top-right',
      });
      onClose();
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi vô hiệu hóa bàn.';
      toast.error(errorMessage, {
        position: 'top-right',
      });
      console.error('Disable table error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Vô hiệu hóa bàn</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn vô hiệu hóa bàn {table?.tableNumber}? Bàn sẽ được đánh dấu là "Đang sử dụng".
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button variant="default" onClick={handleDisable} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Vô hiệu hóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}