"use client";

import { useDeleteMenuMutation } from "@/features/menu/menuApiSlice";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";

const MenuDeleteConfirm = ({ menuId }: { menuId: number }) => {
  const [deleteMenu] = useDeleteMenuMutation();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await deleteMenu(menuId).unwrap();
    setOpen(false); 
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="px-4 py-2">Xóa</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white shadow-lg rounded-md border border-gray-200">
        <DialogHeader>
          <h2 className="text-lg font-bold text-gray-900">Xác nhận xóa</h2>
        </DialogHeader>
        <p className="text-gray-700">Bạn có chắc chắn muốn xóa thực đơn này không?</p>
        <DialogFooter className="flex justify-end space-x-3 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="destructive" onClick={handleDelete}>Xác nhận</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MenuDeleteConfirm;
