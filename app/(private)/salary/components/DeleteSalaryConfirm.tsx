import { useDeleteSalaryRateMutation } from '@/features/salary/salaryApiSlice';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeleteSalaryConfirmProps {
  id: number;
  onClose: () => void;
}

export default function DeleteSalaryConfirm({ id, onClose }: DeleteSalaryConfirmProps) {
  const [deleteSalaryRate] = useDeleteSalaryRateMutation();

  const handleDelete = async () => {
    onClose();
    try {
      await deleteSalaryRate(id).unwrap();
    } catch (err: any) {
      let errorMessage = 'Không thể xóa mức lương. ';
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.status === 403) {
        errorMessage = 'Không thể xóa mức lương. Mức lương đang được sử dụng bởi một hoặc nhiều người dùng';
      } else if (err?.status === 404) {
        errorMessage = 'Mức lương không tồn tại.';
      } else if (err?.status === 400) {
        errorMessage = 'Yêu cầu không hợp lệ.';
      } else {
        errorMessage = 'Lỗi khi xóa mức lương: undefined';
      }
      
      toast.error(errorMessage, {
        position: 'top-right',
        duration: 3000,
        style: {
          backgroundColor: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FCA5A5'
        }
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác Nhận Xóa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Bạn có chắc muốn xóa mức lương này không?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
