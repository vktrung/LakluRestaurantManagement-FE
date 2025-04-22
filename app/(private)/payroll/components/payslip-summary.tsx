'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, FileText, User } from "lucide-react";
import { PayslipDetail } from "./payslip-detail";
import { Payslip } from "@/features/payroll/types";

const Avatar = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={`inline-flex items-center justify-center rounded-full ${className}`}>
      {children}
    </div>
  );
};

const AvatarFallback = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={`flex h-full w-full items-center justify-center ${className}`}>
      {children}
    </div>
  );
};

interface PayslipSummaryProps {
  payslips: Payslip[];
}

export function PayslipSummary({ payslips }: PayslipSummaryProps) {
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | undefined>(undefined);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setDetailOpen(true);
  };

  const formatMonthInVietnamese = (dateString: string) => {
    const date = new Date(dateString + "-01");
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "NV";
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {payslips.map((payslip) => (
          <Card key={payslip.payslipId} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Avatar className="h-8 sm:h-10 w-8 sm:w-10 border">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User className="h-4 sm:h-6 w-4 sm:w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm sm:text-base">{payslip.staffName}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">ID: {payslip.staffId}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs sm:text-sm">{formatMonthInVietnamese(payslip.salaryMonth)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:gap-4 py-3 sm:py-4">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-muted-foreground">Ngày làm việc</span>
                  <span className="text-lg sm:text-xl font-bold">{payslip.totalWorkingDays}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-muted-foreground">Giờ làm việc</span>
                  <span className="text-lg sm:text-xl font-bold">{payslip.totalWorkingHours}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-muted-foreground">Tổng lương</span>
                  <span className="text-lg sm:text-xl font-bold text-primary">
                    {payslip.totalSalary.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-muted-foreground">Số lần đi muộn</span>
                  <span className="text-lg sm:text-xl font-bold">{payslip.lateCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-muted-foreground">Giờ đi muộn</span>
                  <span className="text-lg sm:text-xl font-bold">{payslip.lateHours.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-4 sm:px-6 py-2 sm:py-3">
              <div className="flex w-full justify-center">
                <Button variant="ghost" size="sm" className="h-8 sm:h-9 gap-1 text-xs sm:text-sm" onClick={() => handleViewPayslip(payslip)}>
                  <DollarSign className="h-3 sm:h-4 w-3 sm:w-4" />
                  Chi tiết
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <PayslipDetail payslip={selectedPayslip} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  );
}