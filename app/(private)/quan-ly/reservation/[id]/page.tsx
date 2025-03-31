"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { Calendar, Check, Clock, Edit, MapPin, Phone, Trash, User, Users, X, Table, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
import { EditTablesDialog } from "./edit-tables-dialog"
import { ReservationResponse } from "@/features/reservation/type"
import { useGetReservationByIdQuery } from "@/features/reservation/reservationApiSlice"
import { toast } from "sonner"
import { vi } from "date-fns/locale"

// Function to get status badge color
const getStatusColor = (status: string) => {
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

export default function ReservationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [isEditTablesOpen, setIsEditTablesOpen] = useState(false)
  // Key độc nhất cho dialog để ép React tạo mới component khi mở lại
  const [dialogKey, setDialogKey] = useState(0)
  
  // Validate ID
  const reservationId = Number(params.id)
  if (isNaN(reservationId)) {
    router.push("/quan-ly/reservation")
    return null
  }

  // Sử dụng API hook để lấy dữ liệu đặt bàn theo ID
  const {
    data: reservationResponse,
    isLoading,
    error,
    refetch
  } = useGetReservationByIdQuery(reservationId, {
    refetchOnMountOrArgChange: true
  })
  
  // Lấy dữ liệu reservation từ response
  const reservation = reservationResponse?.data

  // Thêm console.log để debug thông tin tableIds
  useEffect(() => {
    if (reservation) {
      console.log('Debug reservation data:', {
        id: reservation.id,
        tables: reservation.detail.tables,
        checkIn: reservation.detail.checkIn
      });
    }
  }, [reservation]);

  // Xử lý mở dialog và tạo key mới
  const handleOpenEditTables = useCallback(() => {
    setDialogKey(prev => prev + 1) // Tạo key mới
    setIsEditTablesOpen(true)
  }, [])

  // Xử lý đóng dialog gộp/tách bàn và refresh dữ liệu
  const handleCloseEditTables = useCallback(() => {
    setIsEditTablesOpen(false)
    // Refetch dữ liệu sau khi đóng dialog
    setTimeout(() => {
      refetch()
    }, 100)
  }, [refetch])

  // Hiển thị thông báo lỗi nếu có
  useEffect(() => {
    if (error) {
      toast.error("Không thể tải thông tin đặt bàn. Vui lòng thử lại sau.")
    }
  }, [error])

  // Format time and date
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-"
    return format(parseISO(dateString), "dd MMM yyyy, HH:mm", { locale: vi })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <div className="text-muted-foreground">Đang tải thông tin đặt bàn...</div>
        </div>
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          ← Quay lại Đặt bàn
        </Button>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-lg">Không tìm thấy thông tin đặt bàn</div>
            <p className="text-muted-foreground mt-2">
              Đặt bàn bạn đang tìm không tồn tại hoặc đã bị xóa.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        ← Quay lại Đặt bàn
      </Button>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-2xl">Đặt bàn #{reservation.id}</CardTitle>
              </div>
              <Badge className={getStatusColor(reservation.detail.status)} variant="secondary">
                {reservation.detail.status === "PENDING" && "Đang chờ"}
                {reservation.detail.status === "CONFIRMED" && "Đã xác nhận"}
                {reservation.detail.status === "COMPLETED" && "Hoàn thành"}
                {reservation.detail.status === "CANCELLED" && "Đã hủy"}
              </Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Thông tin khách hàng</h3>
                    <p>{reservation.detail.customerName}</p>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3 mr-1" />
                      {reservation.detail.customerPhone}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Số lượng khách</h3>
                    <p>{reservation.detail.numberOfPeople} người</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Phân bổ bàn</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {reservation.detail.tables?.length ? (
                        reservation.detail.tables.map((table) => (
                          <Badge key={table.id} variant="outline">
                            {table.tableNumber}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">Chưa có bàn nào</span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Thời gian</h3>
                    <p>Check in: {formatDateTime(reservation.detail.checkIn)}</p>
                    {reservation.detail.checkOut ? (
                      <p>Check out: {formatDateTime(reservation.detail.checkOut)}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Chưa check out</p>
                    )}
                  </div>
                </div>

                {reservation.detail.reservationTime && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium">Chi tiết đặt trước</h3>
                        <p>Đã đặt vào: {formatDateTime(reservation.detail.reservationTime)}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Thao tác</CardTitle>
              <CardDescription>Quản lý đặt bàn này</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reservation.detail.status === "PENDING" && (
                <Button className="w-full" variant="outline">
                  <Check className="mr-2 h-4 w-4" />
                  Xác nhận đặt bàn
                </Button>
              )}

              {!reservation.detail.checkOut && reservation.detail.status !== "CANCELLED" && (
                <Button
                  className="w-full bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                  variant="outline"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Check Out
                </Button>
              )}

              <Button className="w-full" variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Sửa đặt bàn
              </Button>

              {reservation.detail.status !== "CANCELLED" && reservation.detail.status !== "COMPLETED" && (
                <>
                  <Button 
                    className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800" 
                    variant="outline"
                    onClick={handleOpenEditTables}
                  >
                    <Table className="mr-2 h-4 w-4" />
                    Gộp/Tách bàn
                  </Button>
                  
                  <Button
                    className="w-full bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                    variant="outline"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Hủy đặt bàn
                  </Button>
                </>
              )}

              <Button className="w-full" variant="outline">
                <Trash className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">Cập nhật lần cuối: {format(new Date(), "dd MMM yyyy, HH:mm", { locale: vi })}</p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Alert Dialog Hủy đặt bàn */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy đặt bàn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy đặt bàn này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không, giữ lại</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700">Có, hủy đặt bàn</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog gộp/tách bàn - Với key để tạo mới component mỗi khi mở */}
      {isEditTablesOpen && reservation && (
        <div key={dialogKey}>
          <EditTablesDialog
            reservation={reservation}
            isOpen={isEditTablesOpen}
            onClose={handleCloseEditTables}
          />
        </div>
      )}
    </div>
  )
}