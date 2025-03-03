"use client";

import { useCreateMenuMutation, useUpdateMenuMutation } from "@/features/menu/menuApiSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MenuStatus, Menu } from "@/features/menu/types";
import { useState } from "react"; // Added this import
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale";
import { format } from "date-fns";

export const MenuForm = ({
  menu,
  open,
  onOpenChange,
  onClose,
}: {
  menu?: Menu;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
}) => {
  const [createMenu] = useCreateMenuMutation();
  const [updateMenu] = useUpdateMenuMutation();
  const [name, setName] = useState(menu?.name || "");
  const [startAt, setStartAt] = useState<Date | null>(menu ? new Date(menu.startAt) : null);
  const [endAt, setEndAt] = useState<Date | null>(menu ? new Date(menu.endAt) : null);
  const [status, setStatus] = useState<MenuStatus>(menu?.status || MenuStatus.ENABLE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startAt || !endAt) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const formattedStartAt = format(startAt, "yyyy-MM-dd'T'00:00:00");
    const formattedEndAt = format(endAt, "yyyy-MM-dd'T'23:59:59");

    const updatedMenu = { id: menu?.id, name, startAt: formattedStartAt, endAt: formattedEndAt, status };

    if (menu?.id) {
      await updateMenu({ id: menu.id, body: updatedMenu }).unwrap();
    } else {
      await createMenu(updatedMenu).unwrap();
    }

    onOpenChange(false); // Close dialog
    onClose?.(); // Call onClose from parent
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 bg-white shadow-lg rounded-md border border-gray-200">
        <DialogHeader>
          <h2 className="text-xl font-bold mb-4 text-gray-900">{menu ? "Chỉnh sửa Thực Đơn" : "Thêm Thực Đơn Mới"}</h2>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-md font-medium text-gray-800">Tên Thực Đơn</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-md font-medium text-gray-800">Ngày Bắt Đầu</Label>
              <DatePicker
                selected={startAt}
                onChange={(date) => setStartAt(date)}
                dateFormat="dd/MM/yyyy"
                locale={vi}
                placeholderText="Chọn ngày bắt đầu"
                className="w-full p-3 border rounded-md text-center bg-gray-100 focus:ring-2 focus:ring-gray-400 focus:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-md font-medium text-gray-800">Ngày Kết Thúc</Label>
              <DatePicker
                selected={endAt}
                onChange={(date) => setEndAt(date)}
                dateFormat="dd/MM/yyyy"
                locale={vi}
                placeholderText="Chọn ngày kết thúc"
                className="w-full p-3 border rounded-md text-center bg-gray-100 focus:ring-2 focus:ring-gray-400 focus:border-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-md font-medium text-gray-800">Trạng Thái</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as MenuStatus)}>
              <SelectTrigger className="p-3 border rounded-md w-full bg-gray-100 text-gray-900 focus:ring-2 focus:ring-gray-400 focus:border-gray-600">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 rounded-md shadow-lg">
                <SelectItem value={MenuStatus.ENABLE}>Hoạt động</SelectItem>
                <SelectItem value={MenuStatus.DISABLE}>Vô hiệu hóa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex justify-end space-x-3 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-md">
              {menu ? "Cập Nhật" : "Xác Nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};