import { useUpdateSalaryRateMutation } from '@/features/salary/salaryApiSlice';
import { EmployeeSalaryResponse, EmployeeSalaryRequest } from '@/features/salary/types';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SalaryForm from './SalaryForm';

interface EditSalaryModalProps {
  salary: EmployeeSalaryResponse;
  onClose: () => void;
}

export default function EditSalaryModal({ salary, onClose }: EditSalaryModalProps) {
  const [updateSalaryRate] = useUpdateSalaryRateMutation();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: EmployeeSalaryRequest) => {
    try {
      await updateSalaryRate({ id: salary.id, body: data }).unwrap();
      onClose();
      setError(null);
    } catch (err) {
      setError('Lỗi khi cập nhật mức lương: ' + (err as Error).message);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white border border-gray-200 shadow-xl p-6 rounded-lg w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-black text-lg font-semibold">Sửa Mức Lương</DialogTitle>
        </DialogHeader>

        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

        {/* ✅ Remove extra buttons here */}
        <SalaryForm
          initialData={{
            levelName: salary.levelName,
            amount: salary.amount,
            type: salary.type,
            isGlobal: salary.isGlobal,
          }}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
