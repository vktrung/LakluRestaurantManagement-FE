"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ReservationEntry, ReservationStatus } from "@/features/reservation/type"
import { useGetTablesQuery } from "@/features/table/tableApiSlice"
import { ITable } from "@/features/table/type"

// Định nghĩa schema validation
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
  status: z.string(),
  tableIds: z.array(z.coerce.number()).min(1, {
    message: "Phải chọn ít nhất 1 bàn",
  }),
  reservationTime: z.date({
    required_error: "Vui lòng chọn ngày đặt bàn",
  }),
  checkIn: z.date({
    required_error: "Vui lòng chọn ngày check-in",
  }),
});

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  reservation?: ReservationEntry;
  onSubmit: (reservation: any) => void;
}

export default function ReservationDialog({ open, onOpenChange, mode, reservation, onSubmit }: ReservationDialogProps) {
  // const { toast } = useToast()
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Lấy danh sách bàn từ API
  const { data: tablesResponse, isLoading: isLoadingTables, isError: isTablesError } = useGetTablesQuery();
  const tables = tablesResponse?.data || [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
    if (open) {
      setCapacityError(null);
      setDateError(null);

      if (mode === "edit" && reservation) {
        form.reset({
          customerName: reservation.detail.customerName,
          customerPhone: reservation.detail.customerPhone,
          numberOfPeople: reservation.detail.numberOfPeople,
          status: reservation.detail.status,
          tableIds: reservation.detail.tableName.map((name) => Number.parseInt(name)),
          reservationTime: reservation.detail.reservationTime
            ? new Date(reservation.detail.reservationTime)
            : new Date(),
          checkIn: new Date(reservation.timeIn),
        });
      } else if (mode === "add") {
        form.reset({
          customerName: "",
          customerPhone: "",
          numberOfPeople: 1,
          status: "PENDING",
          tableIds: [],
          reservationTime: new Date(),
          checkIn: new Date(),
        });
      }
    }
  }, [mode, reservation, form, open]);

  // Kiểm tra số người và sức chứa của bàn
  useEffect(() => {
    const numberOfPeople = form.watch("numberOfPeople");
    const selectedTableIds = form.watch("tableIds");

    if (numberOfPeople && selectedTableIds.length > 0 && tables.length > 0) {
      // Tính tổng sức chứa của các bàn đã chọn
      const totalCapacity = selectedTableIds.reduce((total, tableId) => {
        const table = tables.find((t) => t.id === tableId);
        return total + (table ? table.capacity : 0);
      }, 0);

      if (numberOfPeople > totalCapacity) {
        setCapacityError(`Số người (${numberOfPeople}) vượt quá sức chứa của các bàn đã chọn (${totalCapacity} người)`);
      } else {
        setCapacityError(null);
      }
    } else {
      setCapacityError(null);
    }
  }, [form.watch("numberOfPeople"), form.watch("tableIds"), tables]);

  // Kiểm tra ngày đặt
  useEffect(() => {
    const reservationTime = form.watch("reservationTime");

    if (reservationTime) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (reservationTime < now) {
        setDateError("Ngày đặt bàn không thể là ngày trong quá khứ");
      } else {
        setDateError(null);
      }
    }
  }, [form.watch("reservationTime")]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // Kiểm tra lỗi trước khi submit
    if (capacityError || dateError) {
      // Có thể hiển thị toast thông báo lỗi ở đây
      return;
    }

    setSubmitting(true);

    try {
      let apiData;
      if (mode === "edit" && reservation) {
        // Chỉ gửi các trường mà API update cho phép
        apiData = {
          id: reservation.id,
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          reservationTime: values.reservationTime.toISOString(),
          checkIn: values.checkIn.toISOString(),
          tableIds: values.tableIds,
          numberOfPeople: values.numberOfPeople,
        };
      } else {
        // Với tạo mới, gửi đầy đủ dữ liệu
        apiData = {
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          reservationTime: values.reservationTime.toISOString(),
          checkIn: values.checkIn.toISOString(),
          tableIds: values.tableIds,
          numberOfPeople: values.numberOfPeople,
          status: values.status as ReservationStatus,
        };
      }

      await onSubmit(apiData);
    } catch (error) {
      // Xử lý lỗi (có thể hiển thị toast thông báo lỗi)
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm lấy màu sắc dựa trên trạng thái bàn
  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-50 border-green-200 text-green-700";
      case "OCCUPIED":
        return "bg-red-50 border-red-200 text-red-700 opacity-60";
      case "RESERVED":
        return "bg-yellow-50 border-yellow-200 text-yellow-700 opacity-60";
      case "MAINTENANCE":
        return "bg-gray-50 border-gray-200 text-gray-700 opacity-60";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  // Hàm lấy tooltip dựa trên trạng thái bàn
  const getTableStatusTooltip = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Bàn trống";
      case "OCCUPIED":
        return "Bàn đang có khách";
      case "RESERVED":
        return "Bàn đã đặt trước";
      case "MAINTENANCE":
        return "Bàn đang bảo trì";
      default:
        return "Không xác định";
    }
  };

  // Tính tổng sức chứa của các bàn đã chọn
  const calculateTotalCapacity = () => {
    const selectedTableIds = form.watch("tableIds");
    return selectedTableIds.reduce((total, tableId) => {
      const table = tables.find((t) => t.id === tableId);
      return total + (table ? table.capacity : 0);
    }, 0);
  };

  // Chuyển đổi dữ liệu bàn từ API để hiển thị
  const mapTableForDisplay = (table: ITable) => {
    return {
      id: table.id.toString(),
      status: table.status,
      capacity: table.capacity,
    };
  };

  // Danh sách bàn đã được chuyển đổi
  const displayTables = tables.map(mapTableForDisplay);

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
            {/* Các FormField khác */}
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên khách hàng</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên khách hàng" {...field} className="hover:border-blue-300 focus:border-blue-500 transition-colors" />
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
                    <Input placeholder="Nhập số điện thoại" {...field} className="hover:border-blue-300 focus:border-blue-500 transition-colors" />
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
                    <Input type="number" min={1} {...field} className="hover:border-blue-300 focus:border-blue-500 transition-colors" />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="hover:border-blue-300 focus:border-blue-500 transition-colors">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">Đang chờ</SelectItem>
                      <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                      <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                      <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sử dụng react-datepicker cho trường reservationTime */}
            <FormField
              control={form.control}
              name="reservationTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày đặt bàn</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date) => field.onChange(date)}
                      dateFormat="PPP"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sử dụng react-datepicker cho trường checkIn (chỉ hiển thị với mode "add") */}
            {mode === "add" && (
              <FormField
                control={form.control}
                name="checkIn"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Thời gian check-in</FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={field.value}
                        onChange={(date: Date) => field.onChange(date)}
                        showTimeSelect
                        dateFormat="PPP HH:mm"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="tableIds"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel className="text-base">Chọn bàn</FormLabel>
                    {isLoadingTables ? (
                      <p className="text-sm text-muted-foreground">Đang tải thông tin bàn...</p>
                    ) : isTablesError ? (
                      <p className="text-sm text-red-500">Lỗi khi tải thông tin bàn</p>
                    ) : (
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">Chỉ hiển thị các bàn có trạng thái "Bàn trống"</p>
                        <p className="text-sm">
                          Sức chứa đã chọn: <span className="font-medium">{calculateTotalCapacity()} người</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {capacityError && (
                    <Alert variant="destructive" className="mb-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Lỗi sức chứa</AlertTitle>
                      <AlertDescription>{capacityError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-5 gap-2">
                    <TooltipProvider>
                      {isLoadingTables ? (
                        <div className="col-span-5 flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : (
                        displayTables.map((table) => (
                          <div key={table.id} className={`border rounded-md p-2 text-center ${getTableStatusColor(table.status)}`}>
                            <div className="flex flex-col items-center">
                              <span className="font-medium">Bàn {table.id}</span>
                              <span className="text-xs">{table.capacity} người</span>
                              {table.status === "AVAILABLE" && (
                                <FormField
                                  control={form.control}
                                  name="tableIds"
                                  render={({ field }) => (
                                    <div className="mt-1">
                                      <Checkbox
                                        checked={field.value?.includes(Number.parseInt(table.id))}
                                        onCheckedChange={(checked) => {
                                          const tableId = Number.parseInt(table.id);
                                          return checked
                                            ? field.onChange([...field.value, tableId])
                                            : field.onChange(field.value?.filter((value) => value !== tableId));
                                        }}
                                        className="data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                                      />
                                      {field.value?.includes(Number.parseInt(table.id)) && (
                                        <CheckCircle2 className="inline-block ml-1 h-4 w-4 text-green-600" />
                                      )}
                                    </div>
                                  )}
                                />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </TooltipProvider>
                  </div>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={submitting || !!capacityError || !!dateError}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : mode === "add" ? (
                  "Thêm đặt bàn"
                ) : (
                  "Cập nhật"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
