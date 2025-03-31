"use client"

import { useState } from "react"
import { Eye, ChevronsRight, User } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Import interfaces
import { Payslip } from "@/features/payroll/types"
import { PayslipDetail } from "./payslip-detail"

// Tạo component Avatar riêng vì không import được @/components/ui/avatar
const Avatar = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={`inline-flex items-center justify-center rounded-full ${className}`}>
      {children}
    </div>
  )
}

const AvatarFallback = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={`flex h-full w-full items-center justify-center ${className}`}>
      {children}
    </div>
  )
}

interface PayslipTableProps {
  payslips: Payslip[]
}

export function PayslipTable({ payslips }: PayslipTableProps) {
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Lấy chữ cái đầu của tên
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "NV"
    
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const handleViewDetail = (payslip: Payslip) => {
    setSelectedPayslip(payslip)
    setIsDetailOpen(true)
  }

  const formatMonth = (month: string) => {
    const date = new Date(month + "-01")
    return format(date, "MMMM yyyy", { locale: vi })
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Mã NV</TableHead>
              <TableHead>Ngày làm</TableHead>
              <TableHead>Tổng lương</TableHead>
              <TableHead>Số lần trễ</TableHead>
              <TableHead>Số giờ trễ</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payslips.map((payslip) => (
              <TableRow key={payslip.payslipId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span>{payslip.staffName}</span>
                  </div>
                </TableCell>
                <TableCell>{payslip.staffId}</TableCell>
                <TableCell>{payslip.totalWorkingDays}</TableCell>
                <TableCell>{payslip.totalSalary.toLocaleString("vi-VN")} đ</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-orange-50">
                    {payslip.lateCount}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-50">
                    {payslip.lateHours}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="outline" onClick={() => handleViewDetail(payslip)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline">
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedPayslip && (
        <PayslipDetail
          payslip={selectedPayslip}
          open={isDetailOpen}
          onOpenChange={(open) => setIsDetailOpen(open)}
        />
      )}
    </>
  )
}