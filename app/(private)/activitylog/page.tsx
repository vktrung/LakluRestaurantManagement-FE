"use client"

import { useState } from "react"
import { DateRange } from "react-day-picker"
import { format, subDays } from "date-fns"
import { Activity, BarChart3, Filter, RefreshCw, Search, User } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ActivityLogTable } from "./components/activity-log-table"
import { ActivityStats } from "./components/activity-stats"
import { DateRangePicker } from "./components/date-range-picker"
import { useGetActivityLogsQuery } from "@/features/activitylog/activityLogApiSlice"
import Loading from "./loading"
import { ActivityLog } from "@/features/activitylog/types"

export default function ActivityDashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date()
  })
  const [currentPage, setCurrentPage] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const [sortConfig, setSortConfig] = useState<{
    field: keyof ActivityLog | undefined
    order: 'asc' | 'desc'
  }>({
    field: undefined,
    order: 'desc'
  })
  const [filter, setFilter] = useState({
    search: "",
  })

  // Query cho danh sách hoạt động chính
  const { data: activityLogs, isLoading } = useGetActivityLogsQuery({
    startTime: format(date?.from || subDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ss"),
    endTime: format(date?.to || new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    page: currentPage,
    size: 10,
  })

  // Query riêng cho hoạt động gần đây
  const { data: recentActivities, isLoading: isLoadingRecent } = useGetActivityLogsQuery({
    startTime: format(subDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss"),
    endTime: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    page: 0,
    size: 10,
    sort: ["createdAt,desc"]
  })

  const handleSort = (field: keyof ActivityLog) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }))
  }

  const sortedData = React.useMemo(() => {
    if (!activityLogs?.content || !sortConfig.field) return activityLogs?.content

    return [...activityLogs.content].sort((a, b) => {
      if (sortConfig.field === 'createdAt') {
        const aTime = new Date(a.createdAt).getTime()
        const bTime = new Date(b.createdAt).getTime()
        return sortConfig.order === 'asc' ? aTime - bTime : bTime - aTime
      }

      if (sortConfig.field === 'userInfo') {
        return sortConfig.order === 'asc' 
          ? a.userInfo.username.localeCompare(b.userInfo.username)
          : b.userInfo.username.localeCompare(a.userInfo.username)
      }

      const aValue = String(a[sortConfig.field as keyof typeof a])
      const bValue = String(b[sortConfig.field as keyof typeof b])

      return sortConfig.order === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })
  }, [activityLogs?.content, sortConfig])

  // Hàm render phân trang
  const renderPagination = () => {
    if (!activityLogs || activityLogs.totalPages <= 1) return null;

    const totalPages = activityLogs.totalPages;
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    // Điều chỉnh startPage nếu endPage đã đạt giới hạn
    if (endPage === totalPages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    // Mảng chứa các nút phân trang
    const paginationItems = [];
    
    // Thêm trang đầu tiên và dấu "..." nếu cần
    if (startPage > 0) {
      paginationItems.push(
        <PaginationItem key="first">
          <PaginationLink
            onClick={() => setCurrentPage(0)}
            isActive={currentPage === 0}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      if (startPage > 1) {
        paginationItems.push(
          <PaginationItem key="start-ellipsis">
            <span className="px-4 py-2">...</span>
          </PaginationItem>
        );
      }
    }
    
    // Thêm các trang hiển thị
    for (let i = startPage; i <= endPage; i++) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Thêm dấu "..." và trang cuối cùng nếu cần
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        paginationItems.push(
          <PaginationItem key="end-ellipsis">
            <span className="px-4 py-2">...</span>
          </PaginationItem>
        );
      }
      
      paginationItems.push(
        <PaginationItem key="last">
          <PaginationLink
            onClick={() => setCurrentPage(totalPages - 1)}
            isActive={currentPage === totalPages - 1}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
              className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {paginationItems}

          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages - 1 && setCurrentPage(currentPage + 1)}
              className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Hoạt động</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý tất cả hoạt động trong hệ thống</p>
        </div>
        <Button disabled={isLoading}>
          {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Làm mới
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="logs">Nhật ký hoạt động</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng số hoạt động</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activityLogs?.totalElements || 0}</div>
                <p className="text-xs text-muted-foreground">Tổng số hoạt động</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoạt động tạo mới</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activityLogs?.content?.filter(log => log.action === "CREATE").length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Số hoạt động tạo mới</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoạt động cập nhật</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activityLogs?.content?.filter(log => log.action === "UPDATE").length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Số hoạt động cập nhật</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Người dùng hoạt động</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(activityLogs?.content?.map(log => log.userInfo.id)).size || 0}
                </div>
                <p className="text-xs text-muted-foreground">Số người dùng hoạt động</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>Các hoạt động trong 24 giờ qua</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRecent ? (
                  <Loading />
                ) : (
                  <>
                    <ActivityStats data={recentActivities?.content || []} />
                    <ActivityLogTable data={recentActivities?.content || []} />
                  </>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Thống kê hoạt động</CardTitle>
                <CardDescription>Phân bố hoạt động theo loại hành động</CardDescription>
              </CardHeader>
              <CardContent>
                {activityLogs?.content && <ActivityStats data={activityLogs.content} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nhật ký hoạt động</CardTitle>
              <CardDescription>Danh sách tất cả hoạt động trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <DateRangePicker date={date} onDateChange={setDate} />
                  </div>
                </div>

                {activityLogs?.content && (
                  <ActivityLogTable 
                    data={sortedData || []} 
                    onSort={handleSort}
                    sortField={sortConfig.field}
                    sortOrder={sortConfig.order}
                  />
                )}

                {renderPagination()}

              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

