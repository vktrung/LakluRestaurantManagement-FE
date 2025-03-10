"use client"

import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Các dialog cho thêm, sửa, xóa, xem đặt bàn
// import ReservationDialog from "./ReservationDialog"
// import DeleteConfirmDialog from "./DeleteConfirmDialog"
// import ViewReservationDialog from "./ViewReservationDialog"

// Import các hook API (đã cấu hình RTK Query)
import {
  useGetReservationsQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
//   useDeleteReservationMutation,
} from "@/features/reservation/reservationApiSlice"
import ReservationDialog from "./ReservationDialog"
import { Reservation } from "@/features/reservation/type"

export default function ReservationList() {
  const { data, isLoading, error } = useGetReservationsQuery()
  const reservations = data?.data || []

  // Các mutation để thêm, sửa, xóa đặt bàn
  const [createReservation] = useCreateReservationMutation()
  const [updateReservation] = useUpdateReservationMutation()
//   const [deleteReservation] = useDeleteReservationMutation()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)

    const handleAdd = async (reservation: Reservation) => {
  try {
    const result = await createReservation(reservation).unwrap()
    setIsAddOpen(false)
    toast.success("Thêm thành công. Đã thêm đặt bàn mới vào hệ thống.")
  } catch (error) {
    console.error("Add reservation error:", error)
    toast.error("Có lỗi xảy ra khi thêm đặt bàn. Vui lòng thử lại.")
  }
}



  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A"
    return format(new Date(dateTimeStr), "HH:mm - dd/MM/yyyy", { locale: vi })
  }

  const getStatusBadge = (status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED") => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            Đang chờ
          </Badge>
        )
      case "CONFIRMED":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            Đã xác nhận
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Hoàn thành
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 hover:bg-red-100"
          >
            Đã hủy
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) return <p className="p-4">Loading...</p>
  if (error) return <p className="p-4 text-red-500">Đã có lỗi xảy ra.</p>

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">Quản lý đặt bàn</CardTitle>
          <CardDescription>Quản lý thông tin đặt bàn của khách hàng</CardDescription>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm đặt bàn
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên khách hàng</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Số người</TableHead>
              <TableHead>Bàn</TableHead>
              <TableHead>Thời gian đặt</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>{reservation.id}</TableCell>
                <TableCell>{reservation.detail.customerName}</TableCell>
                <TableCell>{reservation.detail.customerPhone}</TableCell>
                <TableCell>{reservation.detail.numberOfPeople}</TableCell>
                <TableCell>{reservation.detail.tableName.join(", ")}</TableCell>
                <TableCell>{formatDateTime(reservation.timeIn)}</TableCell>
                <TableCell>{getStatusBadge(reservation.detail.status)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Dialog thêm đặt bàn */}
      <ReservationDialog open={isAddOpen} onOpenChange={setIsAddOpen} mode="add" onSubmit={handleAdd} />

      {/* Dialog sửa đặt bàn */}
      {/* {selectedReservation && (
        <ReservationDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          mode="edit"
          reservation={selectedReservation}
          onSubmit={handleEdit}
        />
      )}

      {/* Dialog xác nhận xóa */}
      {/* {selectedReservation && (
        <DeleteConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDelete}
          reservation={selectedReservation}
        />
      )}

      {/* Dialog xem chi tiết */}
      {/* {selectedReservation && (
        <ViewReservationDialog open={isViewOpen} onOpenChange={setIsViewOpen} reservation={selectedReservation} />
      )}  */}
    </Card>
  )
}
