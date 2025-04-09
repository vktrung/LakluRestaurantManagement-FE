"use client"

import { useState, useCallback, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Calendar, Clock, MapPin, Phone, User, Users, Table } from "lucide-react"
import { vi } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ReservationResponse, ReservationStatus } from "@/features/reservation/type"
import { useRouter } from "next/navigation"

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

// Format time and date
const formatDateTime = (dateString: string | null) => {
  if (!dateString) return "-"
  return format(parseISO(dateString), "dd MMM yyyy, HH:mm", { locale: vi })
}

// Format duration
const formatDuration = (timeIn: string, timeOut: string | null) => {
  if (!timeOut) return "Đang diễn ra"

  const start = parseISO(timeIn)
  const end = parseISO(timeOut)
  const diffInMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))

  const hours = Math.floor(diffInMinutes / 60)
  const minutes = diffInMinutes % 60

  if (hours === 0) return `${minutes} phút`
  return `${hours}h ${minutes}m`
}

interface ReservationDetailDialogProps {
  reservation: ReservationResponse
  isOpen: boolean
  onClose: () => void
}

export function ReservationDetailDialog({ reservation, isOpen, onClose }: ReservationDetailDialogProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  // Xử lý chuyển hướng sau khi đóng dialog - sử dụng useCallback để tránh tạo hàm mới
  const handleEdit = useCallback(() => {
    setIsNavigating(true)
    onClose()
    router.push(`/quan-ly/reservation/${reservation.id}`)
  }, [onClose, router, reservation.id])
  
  const handleEditTablesClick = useCallback(() => {
    setIsNavigating(true)
    onClose()
    router.push(`/quan-ly/reservation/${reservation.id}`)
  }, [onClose, router, reservation.id])

  // Reset trạng thái khi dialog đóng hoặc mở
  useEffect(() => {
    if (isOpen) {
      setIsNavigating(false)
    }
    
    // Cleanup function
    return () => {
      if (!isOpen) {
        setIsNavigating(false)
      }
    }
  }, [isOpen])

  // Tránh render khi đang chuyển hướng
  if (isNavigating) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]" forceMount>
        <DialogHeader>
          <DialogTitle>Đặt bàn #{reservation.id}</DialogTitle>
          <DialogDescription>Chi tiết đặt bàn tạo bởi {reservation.detail.createBy}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Trạng thái</h3>
            <Badge className={getStatusColor(reservation.detail.status)} variant="secondary">
              {reservation.detail.status === "PENDING" && "Đang chờ"}
              {reservation.detail.status === "CONFIRMED" && "Đã xác nhận"}
              {reservation.detail.status === "COMPLETED" && "Hoàn thành"}
              {reservation.detail.status === "CANCELLED" && "Đã hủy"}
            </Badge>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-start">
              <User className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="font-medium">{reservation.detail.customerName}</p>
                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3 mr-1" />
                  {reservation.detail.customerPhone}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-muted-foreground" />
              <p>{reservation.detail.numberOfPeople} người</p>
            </div>

            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                {reservation.detail.tables && reservation.detail.tables.length > 0 ? (
                  <p>Bàn: {reservation.detail.tables.map(table => table.tableNumber).join(", ")}</p>
                ) : (
                  <p>Chưa có bàn nào</p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p>Check in: {formatDateTime(reservation.detail.checkIn)}</p>
                {reservation.detail.checkOut && <p>Check out: {formatDateTime(reservation.detail.checkOut)}</p>}
                <p className="text-sm text-muted-foreground mt-1">
                  Thời gian: {formatDuration(reservation.timeIn, reservation.timeOut)}
                </p>
              </div>
            </div>

            {reservation.detail.reservationTime && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                <p>Đặt trước: {formatDateTime(reservation.detail.reservationTime)}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row sm:space-x-2">
            {reservation.detail.status !== "CANCELLED" && reservation.detail.status !== "COMPLETED" && (
              <Button
                variant="outline"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                onClick={handleEditTablesClick}
              >
                <Table className="mr-2 h-4 w-4" />
                Gộp/Tách bàn
              </Button>
            )}
            {reservation.detail.status === "PENDING" && (
              <Button variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                Xác nhận
              </Button>
            )}
            {!reservation.detail.timeOut && reservation.detail.status !== "CANCELLED" && (
              <Button variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800">
                Check Out
              </Button>
            )}
            <Button onClick={handleEdit}>
              Chỉnh sửa
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}