"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ITable } from "@/features/table/type";
import { useDeleteTableMutation } from "@/features/table/tableApiSlice";

interface DeleteTableModalProps {
  open: boolean;
  onClose: () => void;
  table: ITable | null;
}

export default function DeleteTableModal({
  open,
  onClose,
  table,
}: DeleteTableModalProps) {
  const [deleteTable, { isLoading }] = useDeleteTableMutation();

  const handleDelete = async () => {
    if (!table) return;
    try {
      await deleteTable({ id: table.id }).unwrap();
      onClose();
    } catch (error) {
      console.error("Delete table error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa bàn</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Bạn có chắc chắn muốn xóa bàn {table?.tableNumber}?</p>
          <p className="text-sm text-muted-foreground mt-2">
            Hành động này không thể hoàn tác.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Xóa bàn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
