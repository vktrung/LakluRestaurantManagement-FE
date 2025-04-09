"use client";

import { useState } from "react";
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
import { useAddTableMutation } from "@/features/table/tableApiSlice";

interface AddTableModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddTableModal({ open, onClose }: AddTableModalProps) {
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("2");
  const [addTable, { isLoading }] = useAddTableMutation();

  const handleAdd = async () => {
    try {
      // Khi thêm mới, status sẽ mặc định là AVAILABLE
      await addTable({ tableNumber, capacity: Number(capacity) }).unwrap();
      onClose();
      setTableNumber("");
      setCapacity("2");
    } catch (error) {
      console.error("Add table error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm bàn mới</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tableNumber" className="text-right">
              Số bàn
            </Label>
            <Input
              id="tableNumber"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="capacity" className="text-right">
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
          <Button onClick={handleAdd} disabled={isLoading}>
            Thêm bàn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
