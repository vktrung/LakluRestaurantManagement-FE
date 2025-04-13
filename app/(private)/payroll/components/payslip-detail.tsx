"use client"

import { useState, useEffect } from "react"
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
import { FileText, Loader2 } from "lucide-react"
import { PayslipPrint } from "./payslip-print"
import { Payslip } from "@/features/payroll/types"
import { useGetStaffByIdQuery } from "@/features/staff/staffApiSlice"
import { Staff } from "@/features/staff/types"
import { Skeleton } from "@/components/ui/skeleton"

interface PayslipDetailProps {
  payslip?: Payslip
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PayslipDetail({ payslip, open, onOpenChange }: PayslipDetailProps) {
  // Mặc định hiển thị phiếu lương đầy đủ
  const [showFullPayslip, setShowFullPayslip] = useState(true)
  const [staffData, setStaffData] = useState<Staff | null>(null)
  
  // Cập nhật phần truy xuất dữ liệu nhân viên, đảm bảo luôn hiển thị thông tin
  const { data: staffResponse, isLoading: isLoadingStaff, error: staffError } = useGetStaffByIdQuery(
    payslip?.staffId.toString() || "", 
    { skip: !payslip || !open }
  )
  
  // Cập nhật dữ liệu nhân viên khi có response từ API và log lỗi nếu có
  useEffect(() => {
    if (staffResponse?.data) {
      setStaffData(staffResponse.data)
    } else if (staffError) {
      console.error("Lỗi khi lấy thông tin nhân viên:", staffError)
    }
  }, [staffResponse, staffError])

  // Hàm chuyển đổi tháng sang tiếng Việt
  const formatMonthInVietnamese = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString + "-01")
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `Tháng ${month}/${year}`
  }

  // Hàm chuyển đổi loại lương sang tiếng Việt
  const translateSalaryType = (type: string) => {
    switch (type.toUpperCase()) {
      case "MONTHLY": return "tháng"
      case "HOURLY": return "giờ"
      case "SHIFTLY": return "ca"
      default: return type.toLowerCase()
    }
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

  // Hiển thị phiếu lương đầy đủ (mặc định)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Phiếu Lương</DialogTitle>
          <DialogDescription>
            Phiếu lương của {payslip.staffName} - {formatMonthInVietnamese(payslip.salaryMonth)}
          </DialogDescription>
        </DialogHeader>

        {isLoadingStaff ? (
          <div className="flex flex-col gap-4 items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Đang tải thông tin phiếu lương...</p>
          </div>
        ) : (
          <PayslipPrint payslip={payslip} staffData={staffData} />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

