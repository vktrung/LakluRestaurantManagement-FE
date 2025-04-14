"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { CalendarDays, Check, Clock, Filter, MoreHorizontal, PlusCircle, Search, Users, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ReservationDetailDialog } from "./components/reservation-detail-dialog"
import { vi } from "date-fns/locale"
import { 
  useGetReservationsQuery, 
  useCancelReservationMutation,
  useConfirmReservationMutation,
  useGetReservationsByTimeRangeQuery,
  useSearchReservationsQuery,
  useFilterReservationsQuery
} from "@/features/reservation/reservationApiSlice"
import { toast } from "sonner"
import { ReservationResponse, ReservationStatus, TimeRangeType } from "@/features/reservation/type"

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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  
  // Phân trang và bộ lọc thời gian
  const [timeRange, setTimeRange] = useState<TimeRangeType>("today")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  
  // Format date to YYYY-MM-DD for filter API
  const formattedDate = date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  
  // Xử lý debounce tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        setDebouncedSearchTerm(searchTerm)
        setIsSearching(true)
        setIsFiltering(false)
        setCurrentPage(0) // Reset về trang đầu tiên khi tìm kiếm
      } else {
        setDebouncedSearchTerm("")
        setIsSearching(false)
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchTerm])
  
  // Sử dụng API hook để lấy dữ liệu đặt bàn theo khoảng thời gian
  const { 
    data: timeRangeResponse, 
    error: timeRangeError, 
    isLoading: isTimeRangeLoading 
  } = useGetReservationsByTimeRangeQuery({
    timeRange,
    page: currentPage,
    size: pageSize
  }, { skip: isSearching || isFiltering })
  
  // Sử dụng API hook để tìm kiếm đặt bàn
  const {
    data: searchResponse,
    error: searchError,
    isLoading: isSearchLoading
  } = useSearchReservationsQuery({
    keyword: debouncedSearchTerm,
    page: currentPage,
    size: pageSize
  }, { skip: !isSearching })
  
  // Sử dụng API hook để lọc đặt bàn theo ngày và trạng thái
  const {
    data: filterResponse,
    error: filterError,
    isLoading: isFilterLoading
  } = useFilterReservationsQuery({
    date: formattedDate,
    status: statusFilter || undefined,
    page: currentPage,
    size: pageSize
  }, { skip: !isFiltering })
  
  // Sử dụng API hooks
  const [cancelReservation, { isLoading: isCancelling }] = useCancelReservationMutation()
  const [confirmReservation, { isLoading: isConfirming }] = useConfirmReservationMutation()
  
  // Lấy dữ liệu đặt bàn phân trang (từ tìm kiếm, lọc hoặc theo thời gian)
  const pagedData = isSearching 
    ? searchResponse?.data 
    : isFiltering 
    ? filterResponse?.data 
    : timeRangeResponse?.data
  const pagedReservations = pagedData?.content || []
  const pagination = pagedData?.pagination
  
  // Đang tải dữ liệu
  const isLoading = isSearching 
    ? isSearchLoading 
    : isFiltering 
    ? isFilterLoading 
    : isTimeRangeLoading
  
  // Lỗi từ API
  const error = isSearching 
    ? searchError 
    : isFiltering 
    ? filterError 
    : timeRangeError
  
  // Hiển thị thông báo lỗi nếu có
  useEffect(() => {
    if (error) {
      toast.error("Không thể tải danh sách đặt bàn. Vui lòng thử lại sau.")
    }
  }, [error])
  
  // Lọc đặt bàn theo trạng thái trên client (chỉ dùng khi không sử dụng API lọc)
  const filteredReservations = pagedReservations;

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

  // Xử lý huỷ đặt bàn
  const handleCancelReservation = async (id: number) => {
    try {
      await cancelReservation(id).unwrap()
      toast.success("Đã huỷ đặt bàn thành công!")
      setCancelDialogOpen(false)
      // Refresh dữ liệu sau khi hủy
      if (isFiltering) {
        setIsFiltering(true) // Trigger refetch
      }
    } catch (error) {
      toast.error("Không thể huỷ đặt bàn. Vui lòng thử lại!")
    }
  }

  // Xử lý xác nhận đặt bàn
  const handleConfirmReservation = async (id: number) => {
    try {
      await confirmReservation(id).unwrap()
      toast.success("Đã xác nhận đặt bàn thành công!")
      setConfirmDialogOpen(false)
      // Refresh dữ liệu sau khi xác nhận
      if (isFiltering) {
        setIsFiltering(true) // Trigger refetch
      }
    } catch (error) {
      toast.error("Không thể xác nhận đặt bàn. Vui lòng thử lại!")
    }
  }
  
  // Xử lý khi chọn khoảng thời gian
  const handleTimeRangeChange = (value: string) => {
    setSearchTerm("")
    setDebouncedSearchTerm("")
    setIsSearching(false)
    setIsFiltering(false)
    // Đặt lại bộ lọc khi chọn thời gian
    setStatusFilter(null)
    setDate(undefined)
    setTimeRange(value as TimeRangeType)
    setCurrentPage(0) // Reset về trang đầu tiên khi thay đổi khoảng thời gian
  }
  
  // Xử lý chuyển trang
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }
  
  // Xử lý tìm kiếm
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  // Xử lý xoá tìm kiếm
  const handleClearSearch = () => {
    setSearchTerm("")
    setDebouncedSearchTerm("")
    setIsSearching(false)
  }
  
  // Xử lý khi chọn ngày
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) {
      setIsSearching(false)
      setIsFiltering(true)
      setCurrentPage(0) // Reset về trang đầu tiên khi thay đổi ngày
    }
  }
  
  // Xử lý khi lọc theo trạng thái
  const handleStatusFilterChange = (status: ReservationStatus | null) => {
    setStatusFilter(status)
    setIsSearching(false)
    setIsFiltering(true)
    setCurrentPage(0) // Reset về trang đầu tiên khi thay đổi trạng thái
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
                onChange={handleSearch}
              />
              {searchTerm && (
                <button 
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isSearchLoading && searchTerm && (
                <div className="absolute right-2.5 top-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
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
                  <Calendar 
                    mode="single" 
                    selected={date} 
                    onSelect={handleDateChange} 
                    initialFocus 
                    locale={vi} 
                  />
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
                  <DropdownMenuItem onClick={() => handleStatusFilterChange(null)}>Tất cả</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilterChange("PENDING")}>Đang chờ</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilterChange("CONFIRMED")}>Đã xác nhận</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilterChange("COMPLETED")}>Hoàn thành</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilterChange("CANCELLED")}>Đã hủy</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Select 
            defaultValue={timeRange} 
            onValueChange={handleTimeRangeChange} 
            disabled={isSearching}
          >
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
                <SelectItem value="all">Tất cả</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" className="w-full">


          <TabsContent value="all" className="mt-0">
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {isSearching 
                      ? "Kết quả tìm kiếm" 
                      : isFiltering 
                      ? `Đặt bàn ngày ${date ? format(date, "dd/MM/yyyy", { locale: vi }) : ""}${statusFilter ? ` - ${statusFilter}` : ""}` 
                      : "Tất cả đặt bàn"
                    }
                    {isSearching && <span className="ml-2 text-sm font-normal text-muted-foreground">"{searchTerm}"</span>}
                  </CardTitle>
                  <CardDescription>
                    {pagination?.totalElements ? `${pagination.totalElements} tổng số` : '0 tổng số'}
                  </CardDescription>
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
                              {isSearching 
                                ? "Không tìm thấy đặt bàn nào khớp với tìm kiếm"
                                : isFiltering
                                ? "Không có đặt bàn nào phù hợp với bộ lọc"
                                : "Không có dữ liệu đặt bàn"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredReservations.map((reservation) => (
                            <TableRow key={reservation.id}>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="ml-2">
                                    <div className="font-medium">{reservation.detail.customerName}</div>
                                    <div className="text-sm text-muted-foreground">{reservation.detail.customerPhone}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {reservation.detail.tables && reservation.detail.tables.map((table) => (
                                    <Badge key={table.id} variant="outline">
                                      {table.tableNumber}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>{formatTime(reservation.timeIn)}</TableCell>
                              <TableCell>{formatDate(reservation.timeIn)}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(reservation.detail.status)} variant="outline">
                                  {reservation.detail.status === "PENDING" && "Đang chờ"}
                                  {reservation.detail.status === "CONFIRMED" && "Đã xác nhận"}
                                  {reservation.detail.status === "COMPLETED" && "Hoàn thành"}
                                  {reservation.detail.status === "CANCELLED" && "Đã huỷ"}
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
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        setSelectedReservation(reservation)
                                        setIsDetailOpen(true)
                                      }}
                                    >
                                      Xem chi tiết
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => router.push(`/quan-ly/reservation/${reservation.id}`)}
                                    >
                                      Chỉnh sửa
                                    </DropdownMenuItem>
                                    {(reservation.detail.status === "PENDING" || reservation.detail.status === "CONFIRMED") && (
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          setSelectedReservationId(reservation.id)
                                          setCancelDialogOpen(true)
                                        }}
                                        className="text-red-600"
                                      >
                                        Huỷ đặt bàn
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    
                    {/* Phân trang */}
                    {pagination && pagination.totalPages > 1 && (
                      <div className="flex items-center justify-center space-x-2 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 0 || pagination.first}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm">
                          Trang {currentPage + 1} trên {pagination.totalPages}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= pagination.totalPages - 1 || pagination.last}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
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

      {/* Dialog huỷ đặt bàn */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Huỷ đặt bàn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn huỷ đặt bàn này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedReservationId && handleCancelReservation(selectedReservationId)}
              disabled={isCancelling}
              className="bg-red-600 focus:ring-red-600"
            >
              {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Huỷ đặt bàn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog xác nhận đặt bàn */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đặt bàn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xác nhận đặt bàn này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedReservationId && handleConfirmReservation(selectedReservationId)}
              disabled={isConfirming}
              className="bg-green-600 focus:ring-green-600"
            >
              {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

