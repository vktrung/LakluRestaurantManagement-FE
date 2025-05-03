"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { Calendar, Check, Clock, Edit, MapPin, Phone, Trash, User, Users, X, Table, Loader2, ArrowRight } from "lucide-react"

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
import { TransferTableDialog } from "./transfer-table-dialog"
import { EditReservationDialog } from "./edit-reservation-dialog"
import { ReservationResponse } from "@/features/reservation/type"
import { useGetReservationByIdQuery, useCancelReservationMutation } from "@/features/reservation/reservationApiSlice"
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
  const [isTransferTableOpen, setIsTransferTableOpen] = useState(false)
  const [isEditReservationOpen, setIsEditReservationOpen] = useState(false)
  // Key độc nhất cho dialog để ép React tạo mới component khi mở lại
  const [dialogKey, setDialogKey] = useState(0)
  const [transferDialogKey, setTransferDialogKey] = useState(0)
  const [editReservationDialogKey, setEditReservationDialogKey] = useState(0)
  const [isCancelling, setIsCancelling] = useState(false)
  
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
  
  // Hook huỷ đặt bàn
  const [cancelReservation] = useCancelReservationMutation()
  
  // Lấy dữ liệu reservation từ response
  const reservation = reservationResponse?.data

  // Hiển thị thông báo lỗi nếu có
  useEffect(() => {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể tải thông tin đặt bàn"
      toast.error(`Lỗi: ${errorMessage}`, {
        description: "Vui lòng thử lại hoặc liên hệ quản trị viên",
        duration: 5000,
      })
      console.error("Error loading reservation details:", error)
    }
  }, [error])

  // Format time and date
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-"
    return format(parseISO(dateString), "dd MMM yyyy, HH:mm", { locale: vi })
  }

  // Xử lý huỷ đặt bàn
  const handleCancelReservation = async () => {
    if (!reservationId) return;
    
    try {
      setIsCancelling(true);
      await cancelReservation(reservationId).unwrap();
      toast.success("Đã huỷ đặt bàn thành công!", {
        description: "Đặt bàn đã được hủy và các bàn đã được giải phóng",
        duration: 3000,
      });
      setCancelDialogOpen(false);
      // Sau khi huỷ thành công, refresh lại dữ liệu
      refetch();
    } catch (error: any) {
      // Xử lý lỗi dạng đặc biệt với httpStatus 422
      if (error?.data?.httpStatus === 422 && error?.data?.error && typeof error.data.error === 'object') {
        const validationErrors = Object.entries(error.data.error);
        if (validationErrors.length > 0) {
          const [field, message] = validationErrors[0];
          const errorMessage = String(message);
          toast.error(errorMessage, {
            duration: 5000,
          });
          console.error(`Error cancelling reservation (${field}):`, errorMessage);
          return;
        }
      }
      
      // Xử lý các lỗi thông thường còn lại...
      const errorMessage = error instanceof Error ? error.message : 
                           (error?.data?.message || "Không thể huỷ đặt bàn");
      toast.error(`Lỗi: ${errorMessage}`, {
        description: "Vui lòng thử lại hoặc liên hệ quản trị viên",
        duration: 5000,
      });
      console.error("Error cancelling reservation:", error);
    } finally {
      setIsCancelling(false);
    }
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

        <div className="md:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thao tác</CardTitle>
              <CardDescription>Quản lý đặt bàn này</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Nút chỉnh sửa thông tin */}
              <Button
                className="w-full justify-start"
                onClick={() => setIsEditReservationOpen(true)}
                disabled={reservation.detail.status === "CANCELLED" || reservation.detail.status === "COMPLETED"}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa thông tin
              </Button>
              
              {/* Nút quản lý bàn */}
              <Button
                className="w-full justify-start" 
                onClick={() => setIsEditTablesOpen(true)}
                disabled={reservation.detail.status === "CANCELLED" || reservation.detail.status === "COMPLETED"}
              >
                <Table className="mr-2 h-4 w-4" />
                Quản lý bàn (Gộp/Tách)
              </Button>
              
              {/* Nút chuyển bàn */}
              <Button
                className="w-full justify-start"
                onClick={() => setIsTransferTableOpen(true)}
                disabled={
                  reservation.detail.status === "CANCELLED" || 
                  reservation.detail.status === "COMPLETED" ||
                  !reservation.detail.tables || 
                  reservation.detail.tables.length === 0
                }
                variant="outline"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Chuyển bàn
              </Button>
              
              {/* Nút huỷ đặt bàn */}
              <Button
                className="w-full justify-start"
                onClick={() => setCancelDialogOpen(true)}
                disabled={reservation.detail.status === "CANCELLED" || reservation.detail.status === "COMPLETED"}
                variant="destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Huỷ đặt bàn
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialog chỉnh sửa bàn */}
      {isEditTablesOpen && reservation && (
        <EditTablesDialog
          key={`edit-tables-${dialogKey}`}
          reservation={reservation}
          isOpen={isEditTablesOpen}
          onClose={() => {
            setIsEditTablesOpen(false);
            setTimeout(() => {
              refetch();
            }, 100);
          }}
        />
      )}

      {/* Dialog chuyển bàn */}
      {isTransferTableOpen && reservation && (
        <TransferTableDialog
          key={`transfer-table-${transferDialogKey}`}
          reservation={reservation}
          isOpen={isTransferTableOpen}
          onClose={() => {
            setIsTransferTableOpen(false);
            setTimeout(() => {
              refetch();
            }, 100);
          }}
        />
      )}

      {/* Dialog chỉnh sửa thông tin đặt bàn */}
      {isEditReservationOpen && reservation && (
        <EditReservationDialog
          key={`edit-reservation-${editReservationDialogKey}`}
          reservation={reservation}
          isOpen={isEditReservationOpen}
          onClose={() => {
            setIsEditReservationOpen(false);
            setTimeout(() => {
              refetch();
            }, 100);
          }}
          onSuccess={() => refetch()}
        />
      )}

      {/* Dialog xác nhận huỷ đặt bàn */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc muốn huỷ đặt bàn này?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này không thể hoàn tác. Đặt bàn sẽ bị huỷ và các bàn sẽ được mở khoá để có thể sử dụng cho đặt bàn khác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Huỷ bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelReservation} disabled={isCancelling}>
              {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận huỷ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}