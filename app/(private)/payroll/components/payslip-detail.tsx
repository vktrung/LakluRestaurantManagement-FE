"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Download, FileText } from "lucide-react"
import { PayslipPrint } from "./payslip-print"
import { Payslip } from "@/features/payroll/types"

interface PayslipDetailProps {
  payslip?: Payslip
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PayslipDetail({ payslip, open, onOpenChange }: PayslipDetailProps) {
  const [showFullPayslip, setShowFullPayslip] = useState(false)

  // Hàm chuyển đổi tháng sang tiếng Việt
  const formatMonthInVietnamese = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString + "-01")
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `Tháng ${month}/${year}`
  }

  // Trả về sớm nếu không có phiếu lương
  if (!payslip) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi Tiết Phiếu Lương</DialogTitle>
            <DialogDescription>Chưa chọn phiếu lương</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Hiển thị phiếu lương đầy đủ
  if (showFullPayslip) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Phiếu Lương Đầy Đủ</DialogTitle>
            <DialogDescription>
              Phiếu lương của {payslip.staffName} - {formatMonthInVietnamese(payslip.salaryMonth)}
            </DialogDescription>
          </DialogHeader>

          <PayslipPrint payslip={payslip} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFullPayslip(false)}>
              Quay lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chi Tiết Phiếu Lương</DialogTitle>
          <DialogDescription>
            Phiếu lương của {payslip.staffName} ({payslip.staffId}) -{formatMonthInVietnamese(payslip.salaryMonth)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Thông Tin Nhân Viên</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Mã nhân viên</p>
                <p className="font-medium">{payslip.staffId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tên nhân viên</p>
                <p className="font-medium">{payslip.staffName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mã phiếu lương</p>
                <p className="font-medium">{payslip.payslipId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tháng lương</p>
                <p className="font-medium">{formatMonthInVietnamese(payslip.salaryMonth)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Chi Tiết Lương</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lương cơ bản</span>
                <span className="font-medium">{(0).toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phụ cấp</span>
                <span className="font-medium">{(0).toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Trừ đi muộn</span>
                <span className="font-medium text-destructive">
                  {(0).toLocaleString("vi-VN")} đ
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="font-semibold">Tổng lương</span>
                <span className="font-bold">{payslip.totalSalary.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Tóm Tắt Chấm Công</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Tổng ngày làm việc</p>
                <p className="font-medium">{payslip.totalWorkingDays} ngày</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ngày đã làm</p>
                <p className="font-medium">{payslip.totalWorkingDays - Math.floor(payslip.lateHours / 8)} ngày</p>
              </div>
              <div>
                <p className="text-muted-foreground">Số lần đi muộn</p>
                <p className="font-medium">{payslip.lateCount} lần</p>
              </div>
              <div>
                <p className="text-muted-foreground">Giờ đi muộn</p>
                <p className="font-medium">{payslip.lateHours.toFixed(1)} giờ</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex w-full justify-between">
            <Button variant="outline" className="gap-2" onClick={() => setShowFullPayslip(true)}>
              <FileText className="h-4 w-4" />
              Xem phiếu lương đầy đủ
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

