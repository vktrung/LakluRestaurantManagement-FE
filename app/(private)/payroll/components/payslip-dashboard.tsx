'use client';

import { useState, useEffect } from "react";
import { CalendarIcon, RefreshCw, Info, AlertCircle } from "lucide-react";
import { format, startOfMonth, isAfter, endOfMonth } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useGetPayslipsQuery, useUpdatePayslipsMutation } from "@/features/payroll/payrollApiSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useGetUserMeQuery } from "@/features/auth/authApiSlice";

import dynamic from 'next/dynamic';

const PayslipTable = dynamic(() => import('./payslip-table').then(mod => mod.PayslipTable), {
  ssr: false,
  loading: () => <div className="py-10 text-center text-sm sm:text-base">Đang tải bảng phiếu lương...</div>
});

const PayslipSummary = dynamic(() => import('./payslip-summary').then(mod => mod.PayslipSummary), {
  ssr: false,
  loading: () => <div className="py-10 text-center text-sm sm:text-base">Đang tải dữ liệu phiếu lương...</div>
});

export function PayslipDashboard() {
  const [date, setDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  const { data: userData, isLoading: isLoadingUser } = useGetUserMeQuery();

  const hasFullAccess = userData?.data?.permissions?.includes("payslips:list");
  const hasViewAccess = userData?.data?.permissions?.includes("payslips:view");
  const staffId = userData?.data?.id?.toString();

  const { data: payslipData, isLoading, error } = useGetPayslipsQuery(
    hasFullAccess ? selectedMonth : `${staffId}/${selectedMonth}`,
    { skip: !userData || (!hasFullAccess && !hasViewAccess) }
  );

  const [updatePayslips, { isLoading: isUpdating }] = useUpdatePayslipsMutation();

  const payslips = Array.isArray(payslipData?.data)
    ? payslipData?.data || []
    : payslipData?.data
      ? [payslipData.data]
      : [];

  const totalSalary = payslips.reduce((sum, payslip) => sum + (payslip?.totalSalary || 0), 0);
  const averageSalary = payslips.length > 0 ? totalSalary / payslips.length : 0;
  const employeeCount = payslips.length;

  useEffect(() => {
    if (date) {
      setSelectedMonth(format(date, "yyyy-MM"));
    }
  }, [date]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const firstDayOfMonth = startOfMonth(selectedDate);
      setDate(firstDayOfMonth);
    }
  };

  const isDateUnavailable = (date: Date) => {
    const firstDayOfCurrentMonth = startOfMonth(new Date());
    const lastAllowedDay = endOfMonth(firstDayOfCurrentMonth);
    return isAfter(date, lastAllowedDay);
  };

  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return "Chọn tháng";
    return format(date, "MMMM yyyy", { locale: vi });
  };

  const handleUpdatePayslips = async () => {
    try {
      await updatePayslips(selectedMonth).unwrap();
      toast.success('Đã cập nhật lương thành công');
    } catch (error) {
      toast.error('Không thể cập nhật lương: ' + (error as Error).message);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32 sm:h-10 sm:w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <Skeleton className="h-32 sm:h-40 w-full" />
          <Skeleton className="h-32 sm:h-40 w-full" />
          <Skeleton className="h-32 sm:h-40 w-full" />
        </div>
        <Skeleton className="h-64 sm:h-96 w-full" />
      </div>
    );
  }

  if (!hasFullAccess && !hasViewAccess) {
    return (
      <Alert className="m-4 sm:m-6 bg-destructive/10 border-destructive">
        <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 text-destructive" />
        <AlertTitle className="text-sm sm:text-base">Không có quyền truy cập</AlertTitle>
        <AlertDescription className="text-xs sm:text-sm">
          Bạn không có quyền truy cập vào phần quản lý lương. Vui lòng liên hệ quản trị viên nếu đây là một sai sót.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {hasFullAccess ? "Quản Lý Lương" : "Phiếu Lương Của Tôi"}
        </h1>
      </div>

      {hasFullAccess && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base">Tổng Lương</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Tổng lương tháng hiện tại</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-full" />
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold">{totalSalary.toLocaleString("vi-VN")} đ</div>
                  <p className="text-xs text-muted-foreground">Tháng {date ? format(date, "MM/yyyy") : ""}</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base">Nhân Viên Đã Được Tính Lương</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Số nhân viên đã xử lý</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-full" />
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold">{employeeCount}</div>
                  <p className="text-xs text-muted-foreground">Tháng {date ? format(date, "MM/yyyy") : ""}</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base">Lương Trung Bình</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Lương trung bình mỗi nhân viên</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-full" />
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold">{averageSalary.toLocaleString("vi-VN")} đ</div>
                  <p className="text-xs text-muted-foreground">Tháng {date ? format(date, "MM/yyyy") : ""}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 pb-2">
          <div>
            <CardTitle className="text-base sm:text-lg">{hasFullAccess ? "Bảng Lương" : "Phiếu Lương"}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {hasFullAccess ? "Xem và quản lý phiếu lương nhân viên" : "Xem phiếu lương của bạn"}
            </CardDescription>
          </div>
          {hasFullAccess && (
            <Button
              onClick={handleUpdatePayslips}
              disabled={isUpdating}
              className="gap-2 h-8 sm:h-9 text-xs sm:text-sm"
            >
              <RefreshCw className={`h-3 sm:h-4 w-3 sm:w-4 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Đang cập nhật...' : 'Cập nhật lương'}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[160px] sm:w-[200px] justify-start text-left font-normal text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <CalendarIcon className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
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

            {!isLoading && !error && payslips.length === 0 && (
              <Alert className="mb-2 bg-amber-50 border-amber-200">
                <Info className="h-3 sm:h-4 w-3 sm:w-4 text-amber-500" />
                <AlertTitle className="text-xs sm:text-sm text-amber-700">Không có dữ liệu</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm text-amber-600">
                  Không tìm thấy phiếu lương trong tháng {date ? format(date, "MM/yyyy") : ""}.
                  {hasFullAccess
                    ? " Vui lòng chọn tháng khác hoặc liên hệ quản trị viên."
                    : " Vui lòng chọn tháng khác hoặc liên hệ bộ phận nhân sự."}
                </AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 sm:h-10 w-full" />
                <Skeleton className="h-48 sm:h-64 w-full" />
              </div>
            ) : error ? (
              <div className="text-center text-destructive py-8 text-xs sm:text-sm">
                <AlertCircle className="h-4 sm:h-6 w-4 sm:w-6 mx-auto mb-2" />
                Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
              </div>
            ) : payslips.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 sm:py-16 border rounded-md bg-muted/20">
                <Info className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-4 text-muted-foreground/60" />
                <p className="text-base sm:text-lg font-medium">Không có dữ liệu phiếu lương</p>
                <p className="text-xs sm:text-sm">
                  {hasFullAccess
                    ? "Hãy chọn một tháng khác hoặc tạo phiếu lương cho tháng này"
                    : "Hãy chọn một tháng khác để xem phiếu lương của bạn"}
                </p>
              </div>
            ) : (
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid grid-cols-2 w-full sm:w-[400px] h-8 sm:h-10">
                  <TabsTrigger value="table" className="text-xs sm:text-sm">
                    Dạng Bảng
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="text-xs sm:text-sm">
                    Dạng Tóm Tắt
                  </TabsTrigger>
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
  );
}