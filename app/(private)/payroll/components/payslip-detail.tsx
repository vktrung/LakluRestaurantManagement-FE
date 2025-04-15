'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Loader2 } from "lucide-react";
import { PayslipPrint } from "./payslip-print";
import { Payslip } from "@/features/payroll/types";
import { useGetStaffByIdQuery } from "@/features/staff/staffApiSlice";
import { Staff } from "@/features/staff/types";

interface PayslipDetailProps {
  payslip?: Payslip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayslipDetail({ payslip, open, onOpenChange }: PayslipDetailProps) {
  const [staffData, setStaffData] = useState<Staff | null>(null);

  const { data: staffResponse, isLoading: isLoadingStaff, error: staffError } = useGetStaffByIdQuery(
    payslip?.staffId.toString() || "",
    { skip: !payslip || !open }
  );

  useEffect(() => {
    if (staffResponse?.data) {
      setStaffData(staffResponse.data);
    } else if (staffError) {
      console.error("Lỗi khi lấy thông tin nhân viên:", staffError);
    }
  }, [staffResponse, staffError]);

  const formatMonthInVietnamese = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString + "-01");
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `Tháng ${month}/${year}`;
  };

  if (!payslip) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Chi Tiết Phiếu Lương</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Chưa chọn phiếu lương</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 sm:h-9 text-xs sm:text-sm">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Phiếu Lương</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Phiếu lương của {payslip.staffName} - {formatMonthInVietnamese(payslip.salaryMonth)}
          </DialogDescription>
        </DialogHeader>

        {isLoadingStaff ? (
          <div className="flex flex-col gap-4 items-center justify-center py-6 sm:py-8">
            <Loader2 className="h-6 sm:h-8 w-6 sm:w-8 animate-spin text-muted-foreground" />
            <p className="text-xs sm:text-sm text-muted-foreground">Đang tải thông tin phiếu lương...</p>
          </div>
        ) : (
          <PayslipPrint payslip={payslip} staffData={staffData} />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 sm:h-9 text-xs sm:text-sm">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}