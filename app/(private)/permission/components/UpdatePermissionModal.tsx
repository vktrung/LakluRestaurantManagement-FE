'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UpdatePermissionModalProps {
  open: boolean;
  onClose: () => void;
  permissionName: string;          // Tên của permission cần cập nhật
  currentDescription: string;    // Mô tả hiện tại của permission
  onSubmit: (description: string) => void; // Hàm gọi mutation update
}

export default function UpdatePermissionModal({
  open,
  onClose,
  permissionName,
  currentDescription,
  onSubmit
}: UpdatePermissionModalProps) {
  const [description, setDescription] = useState(currentDescription);

  // Đồng bộ state mỗi khi modal mở lại
  React.useEffect(() => {
    if (open) {
      setDescription(currentDescription);
    }
  }, [open, currentDescription]);

  const handleSave = () => {
    console.log('Description gửi đi:', description);
    onSubmit(description);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          {/* Hiển thị tên permission thay vì ID */}
          <DialogTitle>Cập nhật quyền</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave} className="bg-blue-500 text-white hover:bg-blue-600">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
