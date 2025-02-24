import { useDeleteSalaryRateMutation } from '@/features/salary/salaryApiSlice';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeleteSalaryConfirmProps {
  id: number;
  onClose: () => void;
}

export default function DeleteSalaryConfirm({ id, onClose }: DeleteSalaryConfirmProps) {
  const [deleteSalaryRate] = useDeleteSalaryRateMutation();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      await deleteSalaryRate(id).unwrap();
      onClose();
      setError(null);
    } catch (err) {
      setError('Lỗi khi xoá mức lương: ' + (err as Error).message);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white border border-gray-200 shadow-xl p-6 rounded-lg w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-black text-lg font-semibold">Xác Nhận Xóa</DialogTitle>
        </DialogHeader>

        <p className="text-gray-700">Bạn có chắc muốn xóa mức lương này không?</p>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={onClose}>
            Hủy
          </Button>
          <Button className="bg-black text-white hover:bg-gray-900" onClick={handleDelete}>
            Xóa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
