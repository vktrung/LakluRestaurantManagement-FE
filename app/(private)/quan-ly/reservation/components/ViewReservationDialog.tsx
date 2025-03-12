"use client";

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
import { Badge } from "@/components/ui/badge";

import { ReservationResponse } from "@/features/reservation/type";

interface ViewReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: ReservationResponse;
}

export default function ViewReservationDialog({ open, onOpenChange, reservation }: ViewReservationDialogProps) {
  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return "N/A"
    return format(new Date(dateTimeStr), "HH:mm - dd/MM/yyyy", { locale: vi })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Đang chờ
          </Badge>
        )
      case "CONFIRMED":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Đã xác nhận
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Hoàn thành
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Đã hủy
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chi tiết đặt bàn</DialogTitle>
          <DialogDescription>Thông tin chi tiết về đặt bàn</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">ID:</span>
            <span className="col-span-2">{reservation.id}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">Tên khách hàng:</span>
            <span className="col-span-2">{reservation.detail.customerName}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">Số điện thoại:</span>
            <span className="col-span-2">{reservation.detail.customerPhone}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">Số người:</span>
            <span className="col-span-2">{reservation.detail.numberOfPeople}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">Bàn:</span>
            <span className="col-span-2">{reservation.detail.tableIds?.join(", ") || "N/A"}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">Ngày đặt bàn:</span>
            <span className="col-span-2">{formatDateTime(reservation.detail.reservationTime)}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">Thời gian vào:</span>
            <span className="col-span-2">{formatDateTime(reservation.timeIn)}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">Thời gian ra:</span>
            <span className="col-span-2">{formatDateTime(reservation.timeOut)}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">Trạng thái:</span>
            <span className="col-span-2">{getStatusBadge(reservation.detail.status)}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">Người tạo:</span>
            <span className="col-span-2">{reservation.detail.createBy}</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

