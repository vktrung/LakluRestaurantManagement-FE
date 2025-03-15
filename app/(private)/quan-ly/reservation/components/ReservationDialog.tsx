"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ReservationDetail, ReservationStatus } from "@/features/reservation/type";
import { useGetTablesQuery } from "@/features/table/tableApiSlice";
import { ITable } from "@/features/table/type";

const formSchema = z.object({
  customerName: z.string().min(2, "Tên khách hàng phải có ít nhất 2 ký tự"),
  customerPhone: z.string().min(10, "Số điện thoại không hợp lệ"),
  numberOfPeople: z.number().min(1, "Số người phải lớn hơn 0"),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
  tableIds: z.array(z.number()).min(1, "Phải chọn ít nhất 1 bàn"),
  reservationTime: z.date(),
  checkIn: z.date(),
});

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  reservation?: ReservationDetail;
  onSubmit: (reservation: any) => void;
}

export default function ReservationDialog({ open, onOpenChange, mode, reservation, onSubmit }: ReservationDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const { data: tablesResponse, isLoading: isLoadingTables } = useGetTablesQuery();
  const tables = tablesResponse?.data || [];

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      customerName: "",
      customerPhone: "",
      numberOfPeople: 1,
      status: "PENDING",
      tableIds: [],
      reservationTime: new Date(),
      checkIn: new Date(),
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
        reservationTime: reservation.reservationTime ? new Date(reservation.reservationTime) : new Date(),
        checkIn: reservation.checkIn ? new Date(reservation.checkIn) : new Date(),
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Thêm đặt bàn mới" : "Chỉnh sửa đặt bàn"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Nhập thông tin đặt bàn mới" : "Chỉnh sửa thông tin đặt bàn"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="customerName" render={({ field }) => (
              <FormItem>
                <FormLabel>Tên khách hàng</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="customerPhone" render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )} />

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
