'use client';

import { useState } from "react";
import { Eye, ChevronsRight, User } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { Payslip } from "@/features/payroll/types";
import { PayslipDetail } from "./payslip-detail";

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

interface PayslipTableProps {
  payslips: Payslip[];
}

export function PayslipTable({ payslips }: PayslipTableProps) {
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "NV";
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleViewDetail = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setIsDetailOpen(true);
  };

  const formatMonth = (month: string) => {
    const date = new Date(month + "-01");
    return format(date, "MMMM yyyy", { locale: vi });
  };

  return (
    <>
      {/* Desktop: Table */}
      <div className="hidden sm:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm">Nhân viên</TableHead>
              <TableHead className="text-xs sm:text-sm">Mã NV</TableHead>
              <TableHead className="text-xs sm:text-sm">Ngày làm</TableHead>
              <TableHead className="text-xs sm:text-sm">Giờ làm</TableHead>
              <TableHead className="text-xs sm:text-sm">Tổng lương</TableHead>
              <TableHead className="text-xs sm:text-sm">Số lần trễ</TableHead>
              <TableHead className="text-xs sm:text-sm">Số giờ trễ</TableHead>
              <TableHead className="text-right text-xs sm:text-sm">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payslips.map((payslip) => (
              <TableRow key={payslip.payslipId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 sm:h-8 w-6 sm:w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                        <User className="h-3 sm:h-4 w-3 sm:w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs sm:text-sm">{payslip.staffName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs sm:text-sm">{payslip.staffId}</TableCell>
                <TableCell className="text-xs sm:text-sm">{payslip.totalWorkingDays}</TableCell>
                <TableCell className="text-xs sm:text-sm">{payslip.totalWorkingHours}</TableCell>
                <TableCell className="text-xs sm:text-sm">{payslip.totalSalary.toLocaleString("vi-VN")} đ</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-orange-50 text-xs sm:text-sm">
                    {payslip.lateCount}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-50 text-xs sm:text-sm">
                    {payslip.lateHours}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="outline" onClick={() => handleViewDetail(payslip)} className="h-8 sm:h-10 w-8 sm:w-10">
                      <Eye className="h-3 sm:h-4 w-3 sm:w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 sm:h-10 w-8 sm:w-10">
                      <ChevronsRight className="h-3 sm:h-4 w-3 sm:w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: Cards */}
      <div className="sm:hidden flex flex-col gap-4">
        {payslips.map((payslip) => (
          <Card key={payslip.payslipId}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xs font-medium">{payslip.staffName}</div>
                    <div className="text-xs text-muted-foreground">ID: {payslip.staffId}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">{formatMonth(payslip.salaryMonth)}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Ngày làm:</span>
                  <span className="font-medium ml-1">{payslip.totalWorkingDays}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Giờ làm:</span>
                  <span className="font-medium ml-1">{payslip.totalWorkingHours}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tổng lương:</span>
                  <span className="font-medium ml-1">{payslip.totalSalary.toLocaleString("vi-VN")} đ</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Lần trễ:</span>
                  <span className="font-medium ml-1">{payslip.lateCount}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => handleViewDetail(payslip)} className="h-8 text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  Chi tiết
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs">
                  <ChevronsRight className="h-3 w-3 mr-1" />
                  Xem
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPayslip && (
        <PayslipDetail
          payslip={selectedPayslip}
          open={isDetailOpen}
          onOpenChange={(open) => setIsDetailOpen(open)}
        />
      )}
    </>
  );
}