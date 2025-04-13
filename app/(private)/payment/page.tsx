"use client"

import { useGetPaymentsQuery } from "@/features/payment/PaymentApiSlice"
import { PaymentList } from "./components/PaymentList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, Loader2, Calendar } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState } from "react"
import { PaginatedPaymentResponse } from "@/features/payment/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, subDays, isAfter, endOfDay, startOfDay, formatISO } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function PaymentManagementPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")

  // Ngày hiện tại và ngày cách đây 7 ngày để làm mặc định
  const today = new Date()
  const sevenDaysAgo = subDays(today, 7)

  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: sevenDaysAgo,
    endDate: today
  })

  const [openStartDate, setOpenStartDate] = useState(false)
  const [openEndDate, setOpenEndDate] = useState(false)

  // Format các ngày thành chuỗi ISO cho API
  const formattedStartDate = format(startOfDay(dateRange.startDate), "yyyy-MM-dd'T'HH:mm:ssXXX")
  const formattedEndDate = format(endOfDay(dateRange.endDate), "yyyy-MM-dd'T'HH:mm:ssXXX")

  const { data, error, isLoading, refetch } = useGetPaymentsQuery({
    page,
    pageSize,
    startDate: formattedStartDate,
    endDate: formattedEndDate
  })

  const router = useRouter()

  // Trích xuất dữ liệu phân trang từ response
  const paginatedData: PaginatedPaymentResponse = data?.data || {
    payments: [],
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
    sortBy: "createdAt",
    sortDirection: "desc"
  }

  const { payments, currentPage, totalItems, totalPages } = paginatedData;

  // Hàm xử lý thay đổi trang
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  // Làm mới dữ liệu
  const handleRefresh = () => {
    refetch()
  }

  // Xử lý thay đổi startDate
  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;

    // Nếu ngày bắt đầu sau ngày kết thúc, cập nhật cả hai
    if (isAfter(date, dateRange.endDate)) {
      setDateRange({
        startDate: date,
        endDate: date
      })
    } else {
      setDateRange({
        ...dateRange,
        startDate: date
      })
    }
    setOpenStartDate(false)
  }

  // Xử lý thay đổi endDate
  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;

    // Nếu ngày kết thúc trước ngày bắt đầu, cập nhật cả hai
    if (isAfter(dateRange.startDate, date)) {
      setDateRange({
        startDate: date,
        endDate: date
      })
    } else {
      setDateRange({
        ...dateRange,
        endDate: date
      })
    }
    setOpenEndDate(false)
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Quản lý hóa đơn thanh toán</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="gap-2 self-start sm:self-auto hover:bg-primary/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại Dashboard</span>
        </Button>
      </div>

      <Card className="shadow-lg border-muted/60 overflow-hidden">
        <CardHeader className="border-b bg-muted/30 px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-md">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">Danh sách hóa đơn</CardTitle>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                {/* Chọn ngày bắt đầu */}
                <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateRange.startDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange.startDate ? (
                        format(dateRange.startDate, "dd/MM/yyyy", { locale: vi })
                      ) : (
                        <span>Từ ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange.startDate}
                      onSelect={handleStartDateChange}
                      disabled={(date) => isAfter(date, today)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Chọn ngày kết thúc */}
                <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateRange.endDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange.endDate ? (
                        format(dateRange.endDate, "dd/MM/yyyy", { locale: vi })
                      ) : (
                        <span>Đến ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange.endDate}
                      onSelect={handleEndDateChange}
                      disabled={(date) => isAfter(date, today)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px] bg-background/50">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4 opacity-80" />
                <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full bg-primary/10"></div>
              </div>
              <p className="text-muted-foreground font-medium">Đang tải dữ liệu hóa đơn...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="m-6 border-2 animate-in fade-in">
              <AlertTitle className="font-semibold flex items-center gap-2">
                <span className="bg-destructive/20 p-1 rounded-full">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 5V9M8 11.01L8.01 10.999M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Lỗi
              </AlertTitle>
              <AlertDescription className="mt-2">Không thể tải dữ liệu hóa đơn. Vui lòng thử lại sau.</AlertDescription>
            </Alert>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px] bg-background/50">
              <div className="bg-muted/50 p-4 rounded-full mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">Không có hóa đơn</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Không tìm thấy hóa đơn nào từ {format(dateRange.startDate, "dd/MM/yyyy")} đến {format(dateRange.endDate, "dd/MM/yyyy")}.
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <PaymentList
                payments={payments}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}