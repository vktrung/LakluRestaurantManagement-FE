'use client';

import { useState, useEffect } from 'react';
import { useGetStaffQuery } from '@/features/staff/staffApiSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { AddShiftRequest, UpdateShiftRequest, UserShift } from '@/features/schedule/types';

interface Props {
  shiftbyidResp?: any;
  onClose: () => void;
  currentDate: Date;
  handleSubmit: (formData: AddShiftRequest | UpdateShiftRequest) => Promise<void>;
}

export default function EventForm({ shiftbyidResp, onClose, currentDate, handleSubmit }: Props) {
  const { data: staffData, isLoading: isLoadingStaff } = useGetStaffQuery();

  const [formData, setFormData] = useState<AddShiftRequest>({
    user: [{ staffId: 1, isManager: false }],
    shiftStart: '',
    shiftEnd: '',
    shiftType: 'MORNING',
    note: '',
  });

  const [staffs, setStaffs] = useState<UserShift[]>([{ staffId: 1, isManager: false }]);

  useEffect(() => {
    console.log("🚀 shiftbyidResp received in EventForm:", shiftbyidResp);
    if (shiftbyidResp?.data) {
      console.log("✅ Cập nhật formData với shiftbyidResp:", shiftbyidResp.data);
      setFormData({
        user: shiftbyidResp.data.user || [{ staffId: 1, isManager: false }],
        shiftStart: shiftbyidResp.data.shiftStart || '',
        shiftEnd: shiftbyidResp.data.shiftEnd || '',
        shiftType: shiftbyidResp.data.shiftType || 'MORNING',
        note: shiftbyidResp.data.note || '',
      });
      setStaffs(shiftbyidResp.data.user || [{ staffId: 1, isManager: false }]);
    }
  }, [shiftbyidResp]);

  const hasManager = staffs.some(staff => staff.isManager);

  const addStaff = () => {
    setStaffs([...staffs, { staffId: 1, isManager: false }]);
  };

  const removeStaff = (index: number) => {
    setStaffs(staffs.filter((_, i) => i !== index));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const requestData = { ...formData, user: staffs };
    console.log("📤 Submitting requestData:", requestData);
    await handleSubmit(requestData);
    onClose();
  };

  // Lấy danh sách các staffId đã được chọn
  const selectedStaffIds = staffs.map(staff => staff.staffId);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {shiftbyidResp ? 'Chỉnh sửa ca làm' : 'Thêm ca làm'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="datetime-local"
              value={formData.shiftStart}
              onChange={e => setFormData({ ...formData, shiftStart: e.target.value })}
              className="w-full"
            />
            <Input
              type="datetime-local"
              value={formData.shiftEnd}
              onChange={e => setFormData({ ...formData, shiftEnd: e.target.value })}
              className="w-full"
            />
          </div>

          <Select
            value={formData.shiftType}
            onValueChange={value => setFormData({ 
              ...formData, 
              shiftType: value as 'MORNING' | 'EVENING' | 'NIGHT' | 'MORNING_TO_EVENING' | 'EVENING_TO_NIGHT' | 'FULL_DAY'
            })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn ca làm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MORNING">Ca sáng</SelectItem>
              <SelectItem value="EVENING">Ca chiều</SelectItem>
              <SelectItem value="NIGHT">Ca đêm</SelectItem>
              <SelectItem value="MORNING_TO_EVENING">Ca sáng đến chiều</SelectItem>
              <SelectItem value="EVENING_TO_NIGHT">Ca chiều đến tối</SelectItem>
              <SelectItem value="FULL_DAY">Ca cả ngày</SelectItem>
            </SelectContent>
          </Select>

          <div className="bg-gray-100 p-3 rounded-md">
            <p className="font-semibold mb-2">Nhân viên trong ca:</p>
            <div className="flex flex-col gap-2">
              {staffs.map((staff, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={staff.staffId ? staff.staffId.toString() : ''}
                    onValueChange={value => {
                      const newStaffs = [...staffs];
                      newStaffs[index].staffId = Number(value);
                      setStaffs(newStaffs);
                    }}
                  >
                    <SelectTrigger className="w-1/2">
                      <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingStaff ? (
                        <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                      ) : staffData?.data?.length ? (
                        staffData.data.map(s => (
                          <SelectItem
                            key={s.id}
                            value={s.id.toString()}
                            disabled={
                              selectedStaffIds.includes(s.id) && s.id !== staff.staffId
                            }
                          >
                            {s.username}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>Không có nhân viên</SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  <Select
                    value={staff.isManager ? 'manager' : 'staff'}
                    onValueChange={value => {
                      const newStaffs = [...staffs];
                      if (value === 'manager') {
                        newStaffs.forEach((s, i) => newStaffs[i].isManager = i === index);
                      } else {
                        newStaffs[index].isManager = false;
                      }
                      setStaffs(newStaffs);
                    }}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Nhân viên</SelectItem>
                      <SelectItem value="manager" disabled={hasManager && !staff.isManager}>
                        Quản lý
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {staffs.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeStaff(index)}>
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                onClick={addStaff}
                className="w-full flex justify-center gap-2 mt-2"
                variant="outline"
              >
                <Plus className="h-5 w-5" /> Thêm nhân viên
              </Button>
            </div>
          </div>

          <Input
            type="text"
            placeholder="Ghi chú (nếu có)"
            value={formData.note}
            onChange={e => setFormData({ ...formData, note: e.target.value })}
          />

          <Button type="submit" className="w-full">
            {shiftbyidResp ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}