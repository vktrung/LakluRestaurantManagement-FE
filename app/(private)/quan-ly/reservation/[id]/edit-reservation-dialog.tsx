"use client"

import { useState, useEffect } from "react"
import { format, parseISO, set } from "date-fns"
import { vi } from "date-fns/locale"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Clock, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { ReservationResponse } from "@/features/reservation/type"
import { useUpdateReservationMutation } from "@/features/reservation/reservationApiSlice"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Định nghĩa schema validation form
const formSchema = z.object({
  customerName: z.string().min(1, "Vui lòng nhập tên khách hàng"),
  customerPhone: z.string().min(9, "Số điện thoại không hợp lệ"),
  numberOfPeople: z.coerce.number().min(1, "Số người ít nhất là 1"),
  checkInDate: z.date(),
  checkInHour: z.string(),
  checkInMinute: z.string(),
})

type FormValues = z.infer<typeof formSchema>

interface EditReservationDialogProps {
  reservation: ReservationResponse
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EditReservationDialog({ reservation, isOpen, onClose, onSuccess }: EditReservationDialogProps) {
  // State để kiểm soát nút submit
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Hook mutation để cập nhật thông tin đặt bàn
  const [updateReservation, { isLoading }] = useUpdateReservationMutation()

  // Lấy giờ và phút từ checkIn
  const checkInDate = parseISO(reservation.detail.checkIn)
  const checkInHour = checkInDate.getHours().toString().padStart(2, '0')
  const checkInMinute = checkInDate.getMinutes().toString().padStart(2, '0')

  // Tạo form với React Hook Form và Zod resolver
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: reservation.detail.customerName,
      customerPhone: reservation.detail.customerPhone,
      numberOfPeople: reservation.detail.numberOfPeople,
      checkInDate: checkInDate,
      checkInHour: checkInHour,
      checkInMinute: checkInMinute,
    },
  })

  // Xử lý khi form được submit
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      // Tạo ngày giờ đầy đủ từ các trường riêng biệt
      const formattedCheckIn = set(data.checkInDate, {
        hours: parseInt(data.checkInHour),
        minutes: parseInt(data.checkInMinute),
        seconds: 0,
        milliseconds: 0
      })

      // Chuyển đổi dữ liệu form thành định dạng API mong đợi
      const updateData = {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        numberOfPeople: data.numberOfPeople,
        checkIn: format(formattedCheckIn, "yyyy-MM-dd'T'HH:mm:ss"),
        reservationTime: reservation.detail.reservationTime, // Giữ nguyên giá trị cũ
        tableIds: reservation.detail.tables?.map(table => table.id) || []
      }

      // Gọi API cập nhật
      await updateReservation({ id: reservation.id, data: updateData }).unwrap()
      
      // Hiển thị thông báo thành công
      toast.success("Cập nhật thông tin đặt bàn thành công!")
      
      // Callback khi thành công
      if (onSuccess) {
        onSuccess()
      }
      
      // Đóng dialog
      onClose()
    } catch (error) {
      toast.error("Không thể cập nhật đặt bàn. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Tạo danh sách giờ và phút để chọn
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  // Reset form khi reservation thay đổi
  useEffect(() => {
    if (isOpen && reservation) {
      const date = parseISO(reservation.detail.checkIn)
      form.reset({
        customerName: reservation.detail.customerName,
        customerPhone: reservation.detail.customerPhone,
        numberOfPeople: reservation.detail.numberOfPeople,
        checkInDate: date,
        checkInHour: date.getHours().toString().padStart(2, '0'),
        checkInMinute: date.getMinutes().toString().padStart(2, '0'),
      })
    }
  }, [reservation, isOpen, form])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin đặt bàn #{reservation.id}</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin liên hệ khách hàng và thời gian đặt bàn.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên khách hàng</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfPeople"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số người</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={1} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="checkInDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày check-in</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: vi })
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={vi}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <FormField
                  control={form.control}
                  name="checkInHour"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Giờ</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Giờ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {hours.map((hour) => (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkInMinute"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Phút</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Phút" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {minutes.map((minute) => (
                            <SelectItem key={minute} value={minute}>
                              {minute}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Huỷ
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoading}>
                {(isSubmitting || isLoading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 