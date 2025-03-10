"use client"

import { useEffect } from "react"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Reservation } from "@/features/reservation/type"



// Schema validation cho form
const formSchema = z.object({
  customerName: z.string().min(2, {
    message: "Tên khách hàng phải có ít nhất 2 ký tự",
  }),
  customerPhone: z.string().min(10, {
    message: "Số điện thoại không hợp lệ",
  }),
  numberOfPeople: z.coerce.number().min(1, {
    message: "Số người phải lớn hơn 0",
  }),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
  tables: z.array(z.string()).min(1, {
    message: "Phải chọn ít nhất 1 bàn",
  }),
  reservationDate: z.date({
    required_error: "Vui lòng chọn ngày đặt bàn",
  }),
  checkInDate: z.date({
    required_error: "Vui lòng chọn ngày check-in",
  }),
})

type FormData = z.infer<typeof formSchema>

interface ReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  reservation?: Reservation
  onSubmit: (reservation: Reservation) => void
}

export default function ReservationDialog({ open, onOpenChange, mode, reservation, onSubmit }: ReservationDialogProps) {
  // Giá trị mặc định cho form, sử dụng từ reservation nếu có (mode edit)
  const defaultValues: FormData = {
    customerName: reservation?.customerName || "",
    customerPhone: reservation?.customerPhone || "",
    numberOfPeople: reservation?.numberOfPeople || 1,
    status: reservation?.status || "PENDING",
    tables: reservation ? reservation.tableIds.map(String) : [],
    reservationDate: reservation ? new Date(reservation.reservationTime) : new Date(),
    checkInDate: reservation ? new Date(reservation.checkIn) : new Date(),
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  useEffect(() => {
    // Khi reservation thay đổi (chế độ edit) cập nhật giá trị form
    if (reservation) {
      reset({
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        numberOfPeople: reservation.numberOfPeople,
        status: reservation.status,
        tables: reservation.tableIds.map(String),
        reservationDate: new Date(reservation.reservationTime),
        checkInDate: new Date(reservation.checkIn),
      })
    } else {
      reset(defaultValues)
    }
  }, [reservation, reset, defaultValues])

  const onFormSubmit = (data: FormData) => {
    // Chuyển đổi dữ liệu form sang đối tượng Reservation
    const res: Reservation = {
      id: reservation?.id, // Ở chế độ edit, giữ lại id hiện có
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      numberOfPeople: data.numberOfPeople,
      status: data.status,
      tableIds: data.tables.map(Number),
      reservationTime: data.reservationDate.toISOString(),
      checkIn: data.checkInDate.toISOString(),
    }
    onSubmit(res)
    reset(defaultValues)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Thêm đặt bàn" : "Chỉnh sửa đặt bàn"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Tên khách hàng */}
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="customerName" className="text-right">Tên khách hàng</Label>
            <Input id="customerName" {...register("customerName")} className="col-span-2" />
          </div>
          {errors.customerName && <p className="text-red-500 text-sm">{errors.customerName.message}</p>}

          {/* Số điện thoại */}
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="customerPhone" className="text-right">Số điện thoại</Label>
            <Input id="customerPhone" {...register("customerPhone")} className="col-span-2" />
          </div>
          {errors.customerPhone && <p className="text-red-500 text-sm">{errors.customerPhone.message}</p>}

          {/* Số người */}
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="numberOfPeople" className="text-right">Số người</Label>
            <Input id="numberOfPeople" type="number" {...register("numberOfPeople")} className="col-span-2" />
          </div>
          {errors.numberOfPeople && <p className="text-red-500 text-sm">{errors.numberOfPeople.message}</p>}

          {/* Trạng thái */}
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="status" className="text-right">Trạng thái</Label>
            <select id="status" {...register("status")} className="col-span-2 border rounded p-2">
              <option value="PENDING">Đang chờ</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>
          </div>
          {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}

          {/* Chọn bàn (multi-select) */}
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="tables" className="text-right">Bàn</Label>
            <select id="tables" {...register("tables")} multiple className="col-span-2 border rounded p-2">
              <option value="1">Bàn 1</option>
              <option value="2">Bàn 2</option>
              <option value="3">Bàn 3</option>
              <option value="4">Bàn 4</option>
              <option value="5">Bàn 5</option>
            </select>
          </div>
          {errors.tables && <p className="text-red-500 text-sm">{errors.tables.message}</p>}

          {/* Ngày đặt bàn */}
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="reservationDate" className="text-right">Ngày đặt bàn</Label>
            <Input
              id="reservationDate"
              type="date"
              {...register("reservationDate", { valueAsDate: true })}
              className="col-span-2"
            />
          </div>
          {errors.reservationDate && <p className="text-red-500 text-sm">{errors.reservationDate.message}</p>}

          {/* Ngày check-in */}
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="checkInDate" className="text-right">Ngày check-in</Label>
            <Input
              id="checkInDate"
              type="date"
              {...register("checkInDate", { valueAsDate: true })}
              className="col-span-2"
            />
          </div>
          {errors.checkInDate && <p className="text-red-500 text-sm">{errors.checkInDate.message}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit">
              {mode === "add" ? "Thêm đặt bàn" : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
