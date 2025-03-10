"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ITable } from "@/features/table/type";
import { useUpdateTableMutation } from "@/features/table/tableApiSlice";

interface EditTableModalProps {
  open: boolean;
  onClose: () => void;
  table: ITable | null;
}

export default function EditTableModal({
  open,
  onClose,
  table,
}: EditTableModalProps) {
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("2");
  const [updateTable, { isLoading }] = useUpdateTableMutation();

  useEffect(() => {
    if (table) {
      setTableNumber(table.tableNumber);
      setCapacity(table.capacity.toString());
    }
  }, [table]);

  const handleEdit = async () => {
    if (!table) return;
    try {
      // Không cho phép thay đổi status
      await updateTable({
        id: table.id,
        tableNumber,
        capacity: Number(capacity),
      }).unwrap();
      onClose();
    } catch (error) {
      console.error("Update table error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sửa thông tin bàn {table?.tableNumber}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="editTableNumber" className="text-right">
              Số bàn
            </Label>
            <Input
              id="editTableNumber"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="editCapacity" className="text-right">
              Sức chứa
            </Label>
            <Select value={capacity} onValueChange={setCapacity}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn sức chứa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 người</SelectItem>
                <SelectItem value="4">4 người</SelectItem>
                <SelectItem value="6">6 người</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleEdit} disabled={isLoading}>
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
