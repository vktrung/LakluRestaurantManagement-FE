"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Download, Filter, Search, AlertCircle, Info, RefreshCw } from "lucide-react"
import { format, subMonths, startOfMonth, isAfter, endOfMonth, set } from "date-fns"
import { vi } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useGetPayslipsQuery, useUpdatePayslipsMutation } from "@/features/payroll/payrollApiSlice"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

// Chỉ import sau khi kiểm tra dữ liệu có tồn tại
import dynamic from 'next/dynamic'

// Import động các component để tránh lỗi
const PayslipTable = dynamic(() => import('./payslip-table').then(mod => mod.PayslipTable), { 
  ssr: false,
  loading: () => <div className="py-10 text-center">Đang tải bảng phiếu lương...</div>
})

const PayslipSummary = dynamic(() => import('./payslip-summary').then(mod => mod.PayslipSummary), {
  ssr: false,
  loading: () => <div className="py-10 text-center">Đang tải dữ liệu phiếu lương...</div>
})

export function PayslipDashboard() {
  // Khởi tạo với tháng hiện tại
  const [date, setDate] = useState<Date | undefined>(startOfMonth(new Date()))
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))
  
  const { data: payslipData, isLoading, error } = useGetPayslipsQuery(selectedMonth)
  const [updatePayslips, { isLoading: isUpdating }] = useUpdatePayslipsMutation()
  
  const payslips = payslipData?.data || []
  
  // Tính tổng lương
  const totalSalary = payslips.reduce((sum, payslip) => sum + payslip.totalSalary, 0)
  
  // Tính lương trung bình
  const averageSalary = payslips.length > 0 ? totalSalary / payslips.length : 0
  
  // Đếm số nhân viên
  const employeeCount = payslips.length

  // Kiểm tra có dữ liệu phiếu lương không
  const hasPayslipData = !isLoading && !error && payslips.length > 0

  // Cập nhật selectedMonth khi date thay đổi
  useEffect(() => {
    if (date) {
      setSelectedMonth(format(date, "yyyy-MM"))
    }
  }, [date])

  // Hàm xử lý khi chọn một ngày trong tháng
  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Đặt ngày là ngày đầu tháng
      const firstDayOfMonth = startOfMonth(selectedDate)
      setDate(firstDayOfMonth)
    }
  }

  // Hàm kiểm tra để chỉ cho phép chọn các tháng từ quá khứ đến hiện tại
  const isDateUnavailable = (date: Date) => {
    // Tạo ngày đầu tháng của tháng hiện tại
    const firstDayOfCurrentMonth = startOfMonth(new Date())
    const lastAllowedDay = endOfMonth(firstDayOfCurrentMonth)
    // Nếu ngày được chọn sau tháng hiện tại, thì không cho phép
    return isAfter(date, lastAllowedDay)
  }

  // Format ngày hiển thị trong UI
  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return "Chọn tháng"
    return format(date, "MMMM yyyy", { locale: vi })
  }

  const handleUpdatePayslips = async () => {
    try {
      await updatePayslips(selectedMonth).unwrap()
      toast.success('Đã cập nhật lương thành công')
    } catch (error) {
      toast.error('Không thể cập nhật lương: ' + (error as Error).message)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản Lý Lương</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tổng Lương</CardTitle>
            <CardDescription>Tổng lương tháng hiện tại</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalSalary.toLocaleString("vi-VN")} đ</div>
                <p className="text-xs text-muted-foreground">Tháng {date ? format(date, "MM/yyyy") : ""}</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Nhân Viên Đã Được Tính Lương</CardTitle>
            <CardDescription>Số nhân viên đã xử lý</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{employeeCount}</div>
                <p className="text-xs text-muted-foreground">Tháng {date ? format(date, "MM/yyyy") : ""}</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Lương Trung Bình</CardTitle>
            <CardDescription>Lương trung bình mỗi nhân viên</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{averageSalary.toLocaleString("vi-VN")} đ</div>
                <p className="text-xs text-muted-foreground">Tháng {date ? format(date, "MM/yyyy") : ""}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Bảng Lương</CardTitle>
            <CardDescription>Xem và quản lý phiếu lương nhân viên</CardDescription>
          </div>
          <Button 
            onClick={handleUpdatePayslips} 
            disabled={isUpdating || payslips.length === 0}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Đang cập nhật...' : 'Cập nhật lương'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">        
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDisplayDate(date)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleSelect}
                      disabled={isDateUnavailable}
                      initialFocus
                      locale={vi}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {!isLoading && !error && payslips.length === 0 && (
              <Alert className="mb-2 bg-amber-50 border-amber-200">
                <Info className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-700">Không có dữ liệu</AlertTitle>
                <AlertDescription className="text-amber-600">
                  Không tìm thấy phiếu lương trong tháng {date ? format(date, "MM/yyyy") : ""}. Vui lòng chọn tháng khác hoặc liên hệ quản trị viên.
                </AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : error ? (
              <div className="text-center text-destructive py-8">
                <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
              </div>
            ) : payslips.length === 0 ? (
              <div className="text-center text-muted-foreground py-16 border rounded-md bg-muted/20">
                <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
                <p className="text-lg font-medium">Không có dữ liệu phiếu lương</p>
                <p className="text-sm">Hãy chọn một tháng khác hoặc tạo phiếu lương cho tháng này</p>
              </div>
            ) : (
              <Tabs defaultValue="table" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
                  <TabsTrigger value="table">Dạng Bảng</TabsTrigger>
                  <TabsTrigger value="summary">Dạng Tóm Tắt</TabsTrigger>
                </TabsList>
                <TabsContent value="table" className="mt-4">
                  <PayslipTable payslips={payslips} />
                </TabsContent>
                <TabsContent value="summary" className="mt-4">
                  <PayslipSummary payslips={payslips} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

