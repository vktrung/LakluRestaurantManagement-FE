"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { CalendarDays, Check, Clock, Filter, MoreHorizontal, PlusCircle, Search, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ReservationDetailDialog } from "./components/reservation-detail-dialog"
import { vi } from "date-fns/locale"
import { useGetReservationsQuery } from "@/features/reservation/reservationApiSlice"
import { toast } from "sonner"
import { ReservationResponse, ReservationStatus } from "@/features/reservation/type"

// Function to get status badge color
const getStatusColor = (status: ReservationStatus) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    case "COMPLETED":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "CANCELLED":
      return "bg-red-100 text-red-800 hover:bg-red-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}

export default function ReservationsPage() {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedReservation, setSelectedReservation] = useState<ReservationResponse | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | null>(null)
  
  // Sử dụng API hook để lấy dữ liệu đặt bàn
  const { data: apiResponse, error, isLoading } = useGetReservationsQuery()
  
  // Lấy dữ liệu đặt bàn từ API response
  const reservations = apiResponse?.data || []
  
  // Hiển thị thông báo lỗi nếu có
  useEffect(() => {
    if (error) {
      toast.error("Không thể tải danh sách đặt bàn. Vui lòng thử lại sau.")
    }
  }, [error])
  
  // Lọc đặt bàn theo tìm kiếm và trạng thái
  const filteredReservations = reservations.filter(reservation => {
    // Tìm kiếm theo tên hoặc số điện thoại
    const matchesSearch = searchTerm === "" || 
      reservation.detail.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.detail.customerPhone.includes(searchTerm)
    
    // Lọc theo trạng thái
    const matchesStatus = statusFilter === null || reservation.detail.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Format time function
  const formatTime = (dateString: string | null) => {
    if (!dateString) return "-"
    return format(parseISO(dateString), "HH:mm", { locale: vi })
  }

  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: vi })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Đặt bàn</h1>
            <p className="text-muted-foreground">Quản lý đặt bàn của khách hàng</p>
          </div>
          <Button onClick={() => router.push("/quan-ly/reservation/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm đặt bàn
          </Button>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Tìm theo tên hoặc số điện thoại..." 
                className="pl-8 w-full md:w-[300px]" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start md:w-auto">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: vi }) : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={vi} />
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Lọc
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>Tất cả</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("PENDING")}>Đang chờ</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("CONFIRMED")}>Đã xác nhận</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("COMPLETED")}>Hoàn thành</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("CANCELLED")}>Đã hủy</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Select defaultValue="today">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Thời gian</SelectLabel>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="yesterday">Hôm qua</SelectItem>
                <SelectItem value="week">Tuần này</SelectItem>
                <SelectItem value="month">Tháng này</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
            <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
            <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Tất cả đặt bàn</CardTitle>
                  <CardDescription>{filteredReservations.length} tổng số</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Khách hàng</TableHead>
                          <TableHead>Bàn</TableHead>
                          <TableHead>Thời gian</TableHead>
                          <TableHead>Ngày</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReservations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                              Không có dữ liệu đặt bàn
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredReservations.map((reservation) => (
                            <TableRow key={reservation.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{reservation.detail.customerName}</div>
                                  <div className="text-sm text-muted-foreground">{reservation.detail.customerPhone}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {reservation.detail.tables && reservation.detail.tables.length > 0 ? (
                                  reservation.detail.tables.map((table) => (
                                    <Badge key={table.id} variant="outline" className="mr-1">
                                      {table.tableNumber}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground">Chưa có bàn</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                  {formatTime(reservation.timeIn)}
                                  {reservation.timeOut && ` - ${formatTime(reservation.timeOut)}`}
                                </div>
                              </TableCell>
                              <TableCell>{formatDate(reservation.timeIn)}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(reservation.detail.status)} variant="secondary">
                                  {reservation.detail.status === "PENDING" && "Đang chờ"}
                                  {reservation.detail.status === "CONFIRMED" && "Đã xác nhận"}
                                  {reservation.detail.status === "COMPLETED" && "Hoàn thành"}
                                  {reservation.detail.status === "CANCELLED" && "Đã hủy"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Mở menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedReservation(reservation)
                                        setIsDetailOpen(true)
                                      }}
                                    >
                                      Xem chi tiết
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {reservation.detail.status === "PENDING" && (
                                      <DropdownMenuItem>
                                        <Check className="mr-2 h-4 w-4" />
                                        Xác nhận
                                      </DropdownMenuItem>
                                    )}
                                    {!reservation.detail.timeOut && reservation.detail.status !== "CANCELLED" && (
                                      <DropdownMenuItem>Check Out</DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => router.push(`/quan-ly/reservation/${reservation.id}`)}>
                                      Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">Hủy đặt bàn</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="mt-0">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle>Đặt bàn đang hoạt động</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Hiển thị đặt bàn đang hoạt động.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle>Đặt bàn sắp tới</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Hiển thị đặt bàn sắp tới.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle>Đặt bàn đã hoàn thành</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Hiển thị đặt bàn đã hoàn thành.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedReservation && (
        <ReservationDetailDialog
          reservation={selectedReservation}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </div>
  )
}

