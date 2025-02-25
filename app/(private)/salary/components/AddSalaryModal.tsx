import { useCreateSalaryRateMutation } from '@/features/salary/salaryApiSlice';
import { EmployeeSalaryRequest } from '@/features/salary/types';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SalaryForm from './SalaryForm';

interface AddSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSalaryModal({ isOpen, onClose }: AddSalaryModalProps) {
  const [createSalaryRate] = useCreateSalaryRateMutation();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: EmployeeSalaryRequest) => {
    try {
      data.isGlobal = false;
      await createSalaryRate(data).unwrap();
      onClose();
      setError(null);
    } catch (err) {
      setError('Lỗi khi tạo mức lương: ' + (err as Error).message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border border-gray-200 shadow-xl p-6 rounded-lg w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-black text-lg font-semibold">Thêm Mức Lương Mới</DialogTitle>
        </DialogHeader>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <SalaryForm onSubmit={handleSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}
