"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { ReservationResponse, ReservationStatus } from "@/features/reservation/type";

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  reservation?: ReservationResponse;
  onSubmit: (reservationData: Partial<ReservationResponse>) => void;
}

export default function ReservationDialog({ 
  open, 
  onOpenChange, 
  mode, 
  reservation, 
  onSubmit 
}: ReservationDialogProps) {
  // State for form fields
  const [customerName, setCustomerName] = useState(reservation?.detail.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(reservation?.detail.customerPhone || "");
  const [numberOfPeople, setNumberOfPeople] = useState(reservation?.detail.numberOfPeople?.toString() || "");
  const [reservationDate, setReservationDate] = useState<Date | undefined>(
    reservation?.detail.reservationTime ? new Date(reservation.detail.reservationTime) : undefined
  );
  const [reservationTime, setReservationTime] = useState(
    reservation?.detail.reservationTime 
      ? format(new Date(reservation.detail.reservationTime), "HH:mm") 
      : ""
  );
  const [tableIds, setTableIds] = useState(reservation?.detail.tableIds?.join(", ") || "");
  const [status, setStatus] = useState<ReservationStatus>(
    reservation?.detail.status || "PENDING"
  );

  const handleSubmit = () => {
    // Basic validation
    if (!customerName || !customerPhone || !numberOfPeople || !reservationDate || !reservationTime) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Combine date and time
    const combinedDateTime = new Date(reservationDate);
    const [hours, minutes] = reservationTime.split(':').map(Number);
    combinedDateTime.setHours(hours, minutes);

    const reservationData: Partial<ReservationResponse> = {
      ...(reservation && { id: reservation.id }), // Include ID for edit mode
      detail: {
        customerName,
        customerPhone,
        numberOfPeople: parseInt(numberOfPeople),
        reservationTime: combinedDateTime.toISOString(),
        tableIds: tableIds ? tableIds.split(',').map(id => id.trim()) : [],
        status,
        createBy: "Current User" // You might want to dynamically set this
      }
    };

    onSubmit(reservationData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Thêm đặt bàn mới" : "Chỉnh sửa đặt bàn"}</DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? "Nhập thông tin đặt bàn mới" 
              : "Chỉnh sửa thông tin đặt bàn"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Customer Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerName" className="text-right">
              Tên khách hàng
            </Label>
            <Input 
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="col-span-3"
              placeholder="Nhập tên khách hàng"
            />
          </div>

          {/* Customer Phone */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerPhone" className="text-right">
              Số điện thoại
            </Label>
            <Input 
              id="customerPhone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="col-span-3"
              placeholder="Nhập số điện thoại"
            />
          </div>

          {/* Number of People */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="numberOfPeople" className="text-right">
              Số người
            </Label>
            <Input 
              id="numberOfPeople"
              type="number"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(e.target.value)}
              className="col-span-3"
              placeholder="Nhập số người"
            />
          </div>

          {/* Reservation Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Ngày đặt bàn</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !reservationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {reservationDate ? (
                    format(reservationDate, "dd/MM/yyyy")
                  ) : (
                    <span>Chọn ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={reservationDate}
                  onSelect={setReservationDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Reservation Time */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reservationTime" className="text-right">
              Giờ đặt bàn
            </Label>
            <Input 
              id="reservationTime"
              type="time"
              value={reservationTime}
              onChange={(e) => setReservationTime(e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* Table IDs */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tableIds" className="text-right">
              Bàn
            </Label>
            <Input 
              id="tableIds"
              value={tableIds}
              onChange={(e) => setTableIds(e.target.value)}
              className="col-span-3"
              placeholder="Nhập ID bàn (cách nhau bằng dấu phẩy)"
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Trạng thái</Label>
            <Select 
              value={status} 
              onValueChange={(value) => setStatus(value as ReservationStatus)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Đang chờ</SelectItem>
                <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>
            {mode === "add" ? "Thêm đặt bàn" : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}