"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, FileText, User } from "lucide-react"
import { PayslipDetail } from "./payslip-detail"
import { Payslip } from "@/features/payroll/types"

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

interface PayslipSummaryProps {
  payslips: Payslip[]
}

export function PayslipSummary({ payslips }: PayslipSummaryProps) {
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | undefined>(undefined)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleViewPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip)
    setDetailOpen(true)
  }

  // Hàm chuyển đổi tháng sang tiếng Việt
  const formatMonthInVietnamese = (dateString: string) => {
    const date = new Date(dateString + "-01")
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${month}/${year}`
  }

  // Hàm lấy initials từ tên nhân viên
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "NV"
    
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {payslips.map((payslip) => (
          <Card key={payslip.payslipId} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{payslip.staffName}</CardTitle>
                    <CardDescription>ID: {payslip.staffId}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">{formatMonthInVietnamese(payslip.salaryMonth)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Ngày làm việc</span>
                  <span className="text-xl font-bold">{payslip.totalWorkingDays}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Giờ làm việc</span>
                  <span className="text-xl font-bold">{payslip.totalWorkingHours}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Tổng lương</span>
                  <span className="text-xl font-bold text-primary">
                    {payslip.totalSalary.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Số lần đi muộn</span>
                  <span className="text-xl font-bold">{payslip.lateCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Giờ đi muộn</span>
                  <span className="text-xl font-bold">{payslip.lateHours.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-3">
              <div className="flex w-full justify-center">
                <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => handleViewPayslip(payslip)}>
                  <DollarSign className="h-4 w-4" />
                  Chi tiết
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <PayslipDetail payslip={selectedPayslip} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  )
}