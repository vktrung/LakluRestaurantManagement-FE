"use client"

import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
// import { useToast } from "@/hooks/use-toast"
// import { Toaster } from "@/components/ui/sonner"
import ReservationDialog from "./ReservationDialog"
import { toast } from "sonner"
// import DeleteConfirmDialog from "./delete-confirm-dialog"
// import ViewReservationDialog from "./ViewReservationDialog"
import { ReservationEntry } from "@/features/reservation/type"
import ViewReservationDialog from "./ViewReservationDialog"

import { useCreateReservationMutation, useUpdateReservationMutation } from "@/features/reservation/reservationApiSlice"

interface ReservationListProps {
  reservations: ReservationEntry[]
}
interface CustomError {
  data?: {
    error?: {
      checkIn?: string;
      reservationTime?: string;
    };
  };
}
export default function ReservationList({ reservations }: ReservationListProps) {
  // const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<ReservationEntry | null>(null)

  // Sử dụng mutation hooks từ RTK Query
  const [createReservation] = useCreateReservationMutation()
  const [updateReservation] = useUpdateReservationMutation()

  // Hàm thêm mới đặt bàn
  const handleAdd = async (newReservationData: any) => {
    try {
      // Gọi API thêm mới đặt bàn
      const response = await createReservation(newReservationData).unwrap()
      console.log("Thêm mới thành công:", response)
      setIsAddOpen(false)
      // Có thể gọi toast thông báo thành công ở đây
    } catch (error) {
      console.error("Lỗi khi thêm mới:", error);
      // toast(.);
      const customError = error as CustomError
      const errorMessage =
        customError.data?.error?.checkIn ||
        customError.data?.error?.reservationTime ||
        "Có lỗi xảy ra khi thêm mới đặt bàn"
      // toast.error(errorMessage);
      toast.error(errorMessage)
    }
  }

  // Hàm cập nhật thông tin đặt bàn
  const handleEdit = async (updatedReservationData: any) => {
    try {
      // Gọi API cập nhật thông tin đặt bàn
      const response = await updateReservation(updatedReservationData).unwrap()
      console.log("Cập nhật thành công:", response)
      setIsEditOpen(false)
      // Có thể gọi toast thông báo thành công ở đây
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error)
      // Có thể gọi toast thông báo lỗi ở đây
    }
  }

  const handleDelete = async () => {
    if (selectedReservation) {
      // Giả lập xóa đặt bàn
      console.log("Xóa:", selectedReservation.id)
      setIsDeleteOpen(false)
      // toast({
      //   title: "Xóa thành công",
      //   description: "Đã xóa đặt bàn khỏi hệ thống",
      // })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Đang chờ
          </Badge>
        )
      case "CONFIRMED":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Đã xác nhận
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Hoàn thành
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Đã hủy
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return "N/A"
    return format(new Date(dateTimeStr), "HH:mm - dd/MM/yyyy", { locale: vi })
  }

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
              <TableHead>Thời gian vào</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  Không có dữ liệu đặt bàn
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((reservation) => (
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
                        onClick={() => {
                          setSelectedReservation(reservation)
                          setIsViewOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedReservation(reservation)
                          setIsEditOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          setSelectedReservation(reservation)
                          setIsDeleteOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Dialog thêm đặt bàn */}
      <ReservationDialog open={isAddOpen} onOpenChange={setIsAddOpen} mode="add" onSubmit={handleAdd} />

      {/* Dialog sửa đặt bàn */}
      {selectedReservation && (
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
      )} */}

      {/* Dialog xem chi tiết */}
      {selectedReservation && (
        <ViewReservationDialog open={isViewOpen} onOpenChange={setIsViewOpen} reservation={selectedReservation} />
      )}
    </Card>
  )
}
