'use client'

import { useState } from "react"
import { format, subDays } from "date-fns"
import { DateRange } from "react-day-picker"
import { vi } from "date-fns/locale"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { DateRangePicker } from "@/app/(private)/activitylog/components/date-range-picker"
import { useGetCashRegisterHistoryQuery } from "@/features/cash-register/cashregisterApiSlice"
import { formatCurrency } from "@/lib/utils"

export default function CashRegisterHistoryPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date()
  })
  const [currentPage, setCurrentPage] = useState(0)

  const { data: transactionHistory, isLoading } = useGetCashRegisterHistoryQuery({
    startDate: format(date?.from || subDays(new Date(), 7), "yyyy-MM-dd"),
    endDate: format(date?.to || new Date(), "yyyy-MM-dd"),
    page: currentPage,
    size: 10,
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch sử Két Tiền</h1>
          <p className="text-muted-foreground">Xem lịch sử các ca làm việc và số tiền trong két</p>
        </div>
        <Button disabled={isLoading}>
          {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Làm mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử Két Tiền</CardTitle>
          <CardDescription>Danh sách các ca làm việc và số tiền trong két</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <DateRangePicker date={date} onDateChange={setDate} />
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[180px]">Thời gian bắt đầu</TableHead>
                    <TableHead className="w-[180px]">Thời gian kết thúc</TableHead>
                    <TableHead className="w-[200px]">Nhân viên</TableHead>
                    <TableHead className="w-[150px] text-right">Số tiền ban đầu</TableHead>
                    <TableHead className="w-[150px] text-right">Số tiền hiện tại</TableHead>
                    <TableHead>Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionHistory?.data.content.map((record) => (
                    <TableRow key={record.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {format(new Date(record.shiftStart), "HH:mm dd/MM/yyyy", { locale: vi })}
                      </TableCell>
                      <TableCell>
                        {record.shiftEnd 
                          ? format(new Date(record.shiftEnd), "HH:mm dd/MM/yyyy", { locale: vi })
                          : "Đang hoạt động"}
                      </TableCell>
                      <TableCell>{record.userFullName}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(record.initialAmount)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(record.currentAmount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{record.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {transactionHistory?.data.totalPages && transactionHistory.data.totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
                      className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {transactionHistory.data.totalPages && Array.from({ length: transactionHistory.data.totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i)}
                        isActive={currentPage === i}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < (transactionHistory.data.totalPages || 0) - 1 && setCurrentPage(currentPage + 1)}
                      className={currentPage === (transactionHistory.data.totalPages || 0) - 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
