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

  const isDisabled = table?.status === 'OCCUPIED';
  const actionText = isDisabled ? 'Kích hoạt lại' : 'Vô hiệu hóa';
  const newStatus = isDisabled ? 'AVAILABLE' : 'OCCUPIED';

  const handleAction = async () => {
    if (!table) return;

    try {
      await updateTable({
        id: table.id,
        status: newStatus,
      }).unwrap();
      toast.success(`Bàn ${table.tableNumber} đã được ${actionText.toLowerCase()}!`, {
        position: 'top-right',
      });
      onClose();
    } catch (error: any) {
      const errorMessage = error?.data?.message || `Có lỗi xảy ra khi ${actionText.toLowerCase()} bàn.`;
      toast.error(errorMessage, {
        position: 'top-right',
      });
      console.error(`${actionText} table error:`, error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{actionText} bàn</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn {actionText.toLowerCase()} bàn {table?.tableNumber}? Bàn sẽ được đánh dấu là "
            {isDisabled ? 'Còn trống' : 'Vô hiệu hóa'}".
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button variant="default" onClick={handleAction} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}