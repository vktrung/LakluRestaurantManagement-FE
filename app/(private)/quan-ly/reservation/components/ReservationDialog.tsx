"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReservationDetail, ReservationStatus } from "@/features/reservation/type";
import { useGetTablesQuery } from "@/features/table/tableApiSlice";
import { ITable } from "@/features/table/type";

const formSchema = z.object({
  customerName: z.string().min(2, "Tên khách hàng phải có ít nhất 2 ký tự"),
  customerPhone: z.string()
    .min(10, "Số điện thoại không hợp lệ")
    .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa số"),
  numberOfPeople: z.number().min(1, "Số người phải lớn hơn 0"),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
  tableIds: z.array(z.number()).min(1, "Phải chọn ít nhất 1 bàn"),
  reservationTime: z.date().nullable(),
  checkIn: z.date(),
  checkOut: z.date().nullable(),
});

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  reservation?: ReservationDetail;
  onSubmit: (reservation: z.infer<typeof formSchema>) => void;
}

export default function ReservationDialog({ 
  open, 
  onOpenChange, 
  mode, 
  reservation, 
  onSubmit 
}: ReservationDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const { data: tablesResponse, isLoading: isLoadingTables } = useGetTablesQuery();
  const tables = tablesResponse?.data || [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      numberOfPeople: 1,
      status: "PENDING",
      tableIds: [],
      reservationTime: null,
      checkIn: new Date(),
      checkOut: null,
    },
  });

  useEffect(() => {
    if (open && mode === "edit" && reservation) {
      form.reset({
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        numberOfPeople: reservation.numberOfPeople,
        status: reservation.status,
        tableIds: reservation.tableIds || [],
        reservationTime: reservation.reservationTime ? new Date(reservation.reservationTime) : null,
        checkIn: reservation.checkIn ? new Date(reservation.checkIn) : new Date(),
        checkOut: reservation.checkOut ? new Date(reservation.checkOut) : null,
      });
    }
  }, [mode, reservation, form, open]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Thêm đặt bàn mới" : "Chỉnh sửa đặt bàn"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Nhập thông tin đặt bàn mới" : "Chỉnh sửa thông tin đặt bàn"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên khách hàng</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên khách hàng" {...field} />
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
                    <Input 
                      placeholder="Nhập số điện thoại" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value)}
                    />
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
                    <Input 
                      type="number" 
                      placeholder="Nhập số người" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">Đang chờ</SelectItem>
                      <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                      <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                      <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
  control={form.control}
  name="tableIds"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Chọn bàn</FormLabel>
      <div className="grid grid-cols-3 gap-2">
        {tables.map((table: ITable) => (
          <div key={table.id} className="flex items-center space-x-2">
            
            <Checkbox
  checked={field.value.includes(table.id)}
  onCheckedChange={(checked) => {
    const currentTableIds = field.value;
    const newTableIds = checked 
      ? [...currentTableIds, table.id] 
      : currentTableIds.filter((id) => id !== table.id);
    field.onChange(newTableIds);
  }}
/>
            <label className="text-sm">{`Bàn ${table.tableNumber} (Sức chứa: ${table.capacity})  ${table.id}` }</label>
          </div>
        ))}
      </div>
      <FormMessage />
    </FormItem>
  )}
/>


            <FormField
              control={form.control}
              name="reservationTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Thời gian đặt bàn</FormLabel>
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="reservationTime"
                      render={({ field: { value, onChange } }) => (
                        <DatePicker
                          selected={value}
                          onChange={(date) => onChange(date)}
                          showTimeSelect
                          dateFormat="Pp"
                          locale={vi}
                          placeholderText="Chọn thời gian đặt bàn"
                          className="w-full p-2 border rounded"
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkIn"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Thời gian check-in</FormLabel>
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="checkIn"
                      render={({ field: { value, onChange } }) => (
                        <DatePicker
                          selected={value}
                          onChange={(date) => onChange(date)}
                          showTimeSelect
                          dateFormat="Pp"
                          locale={vi}
                          placeholderText="Chọn thời gian check-in"
                          className="w-full p-2 border rounded"
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkOut"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Thời gian check-out (tùy chọn)</FormLabel>
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="checkOut"
                      render={({ field: { value, onChange } }) => (
                        <DatePicker
                          selected={value}
                          onChange={(date) => onChange(date)}
                          showTimeSelect
                          dateFormat="Pp"
                          locale={vi}
                          isClearable
                          placeholderText="Chọn thời gian check-out (nếu có)"
                          className="w-full p-2 border rounded"
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang xử lý..." : mode === "add" ? "Thêm đặt bàn" : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}