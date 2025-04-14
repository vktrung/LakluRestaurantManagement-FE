import { useUpdateSalaryRateMutation } from '@/features/salary/salaryApiSlice';
import { EmployeeSalaryResponse, EmployeeSalaryRequest } from '@/features/salary/types';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

interface EditSalaryModalProps {
  salary: EmployeeSalaryResponse;
  onClose: () => void;
}

export default function EditSalaryModal({ salary, onClose }: EditSalaryModalProps) {
  const [updateSalaryRate] = useUpdateSalaryRateMutation();
  const [formData, setFormData] = useState<EmployeeSalaryRequest>({
    levelName: salary.levelName,
    amount: salary.amount,
    type: salary.type,
    isGlobal: salary.isGlobal,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSalaryRate({ id: salary.id, body: formData }).unwrap();
      toast.success('Cập nhật mức lương thành công');
      onClose();
    } catch (err: any) {
      let errorMessage = 'Không thể cập nhật mức lương. ';
      if (err?.data?.message) {
        errorMessage += err.data.message;
      } else {
        errorMessage += 'Vui lòng thử lại sau.';
      }
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa mức lương</DialogTitle>
          <DialogDescription>
            Điều chỉnh thông tin mức lương. Nhấn lưu khi hoàn tất.
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
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
