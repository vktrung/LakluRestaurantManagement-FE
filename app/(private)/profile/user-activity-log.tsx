"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Filter, RefreshCw, Loader2, ArrowUpDown } from "lucide-react"
import { useGetMyProfileQuery, useGetActivityLogsQuery } from "@/features/profile/profileApiSlice"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Định nghĩa kiểu dữ liệu cho log hoạt động
interface UserInfo {
  id: number
  username: string
  email: string
}

interface ActivityLog {
  id: number
  staffId: number
  action: string
  target: string
  targetId: string
  details: string
  message: string
  createdAt: string
  userInfo: UserInfo
}

interface ActivityLogResponse {
  data: ActivityLog[]
  message: string
  httpStatus: number
  timestamp: string
  error: null | string
}

export default function UserActivityLog() {
  const [currentPage, setCurrentPage] = useState(0)
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const pageSize = 10

  const { data: profile } = useGetMyProfileQuery()
  const { data: activityLogs, isLoading, refetch } = useGetActivityLogsQuery(
    {
      userId: profile?.userId || 0,
      page: currentPage,
      size: pageSize,
      sort: [`${sortField},${sortOrder}`],
    },
    {
      skip: !profile?.userId,
    }
  )

  const handleSort = (field: string) => {
    if (field === sortField) {
      // Nếu đang sort theo field này rồi thì đảo ngược thứ tự
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Nếu sort theo field mới thì mặc định sort desc
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Hàm format ngày giờ
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Hàm lấy màu cho badge dựa vào action
  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "UPDATE":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "DELETE":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Hàm lấy tên hiển thị cho target
  const getTargetName = (target: string) => {
    const targetMap: Record<string, string> = {
      Schedule: "Lịch làm việc",
      Attendance: "Điểm danh",
      Reservation: "Đặt bàn",
      ReservationTable: "Bàn đặt",
      Table: "Bàn",
      SalaryRate: "Mức lương",
      Profile: "Hồ sơ",
      Staff: "Nhân viên",
      Role: "Vai trò",
      Permission: "Quyền hạn",
      Category: "Danh mục",
      Dish: "Món ăn",
      Menu: "Thực đơn",
      MenuItem: "Mục thực đơn",
      Payroll: "Bảng lương",
      Voucher: "Phiếu giảm giá",
    }

    return targetMap[target] || target
  }

  if (isLoading) {
    return (
      <Card className="w-full mt-4">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Lịch sử hoạt động</CardTitle>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sắp xếp
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort('createdAt')}>
                Thời gian {sortField === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('action')}>
                Hành động {sortField === 'action' && (sortOrder === 'desc' ? '↓' : '↑')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('target')}>
                Đối tượng {sortField === 'target' && (sortOrder === 'desc' ? '↓' : '↑')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activityLogs?.content?.map((log) => (
              <div key={log.id} className="flex flex-col space-y-1 border-b pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getActionColor(log.action)} font-normal`}>
                      {log.action === "CREATE" ? "Tạo mới" : log.action === "UPDATE" ? "Cập nhật" : "Xóa"}
                    </Badge>
                    <span className="font-medium">{getTargetName(log.target)}</span>
                    <span className="text-sm text-muted-foreground">#{log.targetId}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3.5 w-3.5" />
                    {formatDateTime(log.createdAt)}
                  </div>
                </div>
                <p className="text-sm">{log.details}</p>
              </div>
            ))}
            {!activityLogs?.content?.length && (
              <p className="text-center text-gray-500">Không có hoạt động nào</p>
            )}
          </div>
        </ScrollArea>

        {activityLogs && activityLogs.totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 0) setCurrentPage(currentPage - 1)
                  }}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {(() => {
                // Hiển thị tối đa 5 trang với trang hiện tại ở giữa khi có thể
                const totalPages = activityLogs.totalPages;
                const maxVisiblePages = 5;
                let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
                
                // Điều chỉnh startPage nếu endPage đã đạt giới hạn
                if (endPage === totalPages - 1) {
                  startPage = Math.max(0, endPage - maxVisiblePages + 1);
                }
                
                const visiblePages = [];
                
                // Thêm trang đầu tiên và dấu "..." nếu cần
                if (startPage > 0) {
                  visiblePages.push(
                    <PaginationItem key="first">
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(0);
                        }}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                  );
                  
                  if (startPage > 1) {
                    visiblePages.push(
                      <PaginationItem key="start-ellipsis">
                        <span className="px-4 py-2">...</span>
                      </PaginationItem>
                    );
                  }
                }
                
                // Thêm các trang hiển thị
                for (let i = startPage; i <= endPage; i++) {
                  visiblePages.push(
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === i}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i);
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                // Thêm dấu "..." và trang cuối cùng nếu cần
                if (endPage < totalPages - 1) {
                  if (endPage < totalPages - 2) {
                    visiblePages.push(
                      <PaginationItem key="end-ellipsis">
                        <span className="px-4 py-2">...</span>
                      </PaginationItem>
                    );
                  }
                  
                  visiblePages.push(
                    <PaginationItem key="last">
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(totalPages - 1);
                        }}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                return visiblePages;
              })()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < activityLogs.totalPages - 1) setCurrentPage(currentPage + 1)
                  }}
                  className={currentPage === activityLogs.totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  )
}

