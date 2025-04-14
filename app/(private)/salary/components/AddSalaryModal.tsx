import { useCreateSalaryRateMutation } from '@/features/salary/salaryApiSlice';
import { EmployeeSalaryRequest } from '@/features/salary/types';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

interface AddSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSalaryModal({
  isOpen,
  onClose,
}: AddSalaryModalProps) {
  const [createSalaryRate] = useCreateSalaryRateMutation();
  const [formData, setFormData] = useState<EmployeeSalaryRequest>({
    levelName: '',
    amount: 0,
    type: 'MONTHLY',
    isGlobal: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSalaryRate(formData).unwrap();
      toast.success('Tạo mức lương mới thành công');
      onClose();
    } catch (err: any) {
      let errorMessage = 'Không thể tạo mức lương. ';
      if (err?.data?.message) {
        errorMessage += err.data.message;
      } else {
        errorMessage += 'Vui lòng thử lại sau.';
      }
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo mức lương mới</DialogTitle>
          <DialogDescription>
            Thêm mức lương mới vào hệ thống. Nhập đầy đủ thông tin bên dưới.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="levelName">Tên cấp bậc</Label>
              <Input
                id="levelName"
                value={formData.levelName}
                onChange={(e) => setFormData({ ...formData, levelName: e.target.value })}
                placeholder="Nhập tên cấp bậc"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Mức lương</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                placeholder="Nhập mức lương"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Loại lương</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại lương" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Hàng tháng</SelectItem>
                  <SelectItem value="HOURLY">Theo giờ</SelectItem>
                  <SelectItem value="SHIFTLY">Theo ca</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">
              Tạo mới
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
