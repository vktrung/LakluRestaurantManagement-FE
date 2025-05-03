"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { format, addDays, isToday, isBefore, parse } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { vi } from "date-fns/locale"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useGetTablesByDateQuery, useCreateReservationMutation } from "@/features/reservation/reservationApiSlice"
import { Reservation } from "@/features/reservation/type"

const reservationSchema = z.object({
  customerName: z.string()
    .min(2, "Tên khách hàng phải có ít nhất 2 ký tự")
    .max(50, "Tên khách hàng không được vượt quá 50 ký tự")
    .refine(value => /^[a-zA-ZÀ-ỹ\s]+$/.test(value), {
      message: "Tên khách hàng chỉ được chứa chữ cái và khoảng trắng"
    }),
  customerPhone: z.string()
    .min(10, "Số điện thoại phải có ít nhất 10 chữ số")
    .max(11, "Số điện thoại không được vượt quá 11 chữ số")
    .refine(value => /^[0-9]+$/.test(value), {
      message: "Số điện thoại chỉ được chứa chữ số"
    }),
  numberOfPeople: z.number()
    .int("Số người phải là số nguyên")
    .positive("Số người phải lớn hơn 0")
    .max(100, "Số người không được vượt quá 100 người"),
  tableIds: z.array(z.number())
    .min(1, "Vui lòng chọn ít nhất một bàn"),
  checkInDate: z.date({
    required_error: "Vui lòng chọn ngày đặt bàn",
    invalid_type_error: "Ngày không hợp lệ",
  }),
  checkInTime: z.string()
    .min(1, "Vui lòng chọn thời gian đặt bàn")
})

export default function NewReservationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [checkInDate, setCheckInDate] = useState<Date | null>(null)
  const [checkInTime, setCheckInTime] = useState("")
  const [numberOfPeople, setNumberOfPeople] = useState<number>(2)
  const [selectedTables, setSelectedTables] = useState<number[]>([])
  
  // Error state
  const [errors, setErrors] = useState<{
    customerName?: string
    customerPhone?: string
    numberOfPeople?: string
    tableIds?: string
    checkInDate?: string
    checkInTime?: string
  }>({})

  // Tính ngày hiện tại và ngày tối đa có thể chọn (7 ngày từ hôm nay)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = addDays(today, 7)

  // Format date to YYYY-MM-DD for API
  const formattedDate = checkInDate ? format(checkInDate, "yyyy-MM-dd") : ""
  
  // Fetch available tables for the selected date
  const { data: tablesByDateResponse, isLoading: isLoadingTables } = useGetTablesByDateQuery(
    formattedDate,
    { skip: !formattedDate }
  )
  
  // Sử dụng mutation hook để tạo reservation
  const [createReservation, { isLoading: isCreating }] = useCreateReservationMutation()
  
  // Get available tables from the API response
  const availableTables = tablesByDateResponse?.data || []

  // Danh sách thời gian đặt bàn có thể chọn
  const availableTimes = useMemo(() => {
    const times = [];
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    
    // Chỉ hiển thị giờ từ 18:00 (6h chiều) trở đi
    for (let hour = 18; hour <= 23; hour++) {
      for (let minute of [0, 30]) {
        // Nếu là ngày hôm nay, chỉ hiển thị giờ từ thời điểm hiện tại trở đi
        if (checkInDate && isToday(checkInDate)) {
          // Bỏ qua các thời điểm đã qua trong ngày
          if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
            continue;
          }
        }
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    
    return times;
  }, [checkInDate]);

  // Tự động chọn thời gian đầu tiên khi thay đổi ngày
  useEffect(() => {
    if (checkInDate && availableTimes.length > 0) {
      setCheckInTime(availableTimes[0]);
    } else {
      setCheckInTime("");
    }
  }, [checkInDate, availableTimes]);

  // Reset selected tables when date changes
  useEffect(() => {
    setSelectedTables([])
  }, [checkInDate])

  const toggleTableSelection = (tableId: number) => {
    setSelectedTables((prev) => (prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]))
    
    // Clear error when user selects a table
    if (errors.tableIds) {
      setErrors((prev) => ({ ...prev, tableIds: undefined }))
    }
  }

  const getTableStatusClass = (isAvailable: boolean) => {
    return isAvailable 
      ? "bg-green-100 border-green-300 hover:bg-green-200"
      : "bg-red-100 border-red-300 cursor-not-allowed opacity-70"
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'customerName' | 'customerPhone' | 'numberOfPeople'
  ) => {
    const value = e.target.value
    
    // Handle different field types
    if (field === 'customerName') {
      setCustomerName(value)
      // Clear error when user types
      if (errors.customerName) {
        setErrors(prev => ({ ...prev, customerName: undefined }))
      }
      
      // Validate name format
      if (value && !/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
        setErrors(prev => ({ 
          ...prev, 
          customerName: "Tên khách hàng chỉ được chứa chữ cái và khoảng trắng" 
        }))
      }
    } else if (field === 'customerPhone') {
      // Only allow numbers
      if (value === '' || /^\d+$/.test(value)) {
        setCustomerPhone(value)
        
        // Clear error when user types
        if (errors.customerPhone) {
          setErrors(prev => ({ ...prev, customerPhone: undefined }))
        }
        
        // Validate phone length immediately
        if (value.length > 0 && (value.length < 10 || value.length > 11)) {
          setErrors(prev => ({ 
            ...prev, 
            customerPhone: "Số điện thoại phải có 10 đến 11 chữ số" 
          }))
        }
      }
    } else if (field === 'numberOfPeople') {
      const numberValue = parseInt(value || '0')
      setNumberOfPeople(numberValue)
      
      // Clear error when user types
      if (errors.numberOfPeople) {
        setErrors(prev => ({ ...prev, numberOfPeople: undefined }))
      }
      
      // Validate number of people
      if (numberValue <= 0) {
        setErrors(prev => ({ 
          ...prev, 
          numberOfPeople: "Số người phải lớn hơn 0" 
        }))
      } else if (numberValue > 100) {
        setErrors(prev => ({ 
          ...prev, 
          numberOfPeople: "Số người không được vượt quá 100 người" 
        }))
      }
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    setCheckInDate(date || null)
    
    // Clear error when user selects a date
    if (errors.checkInDate) {
      setErrors(prev => ({ ...prev, checkInDate: undefined }))
    }
  }

  const handleTimeChange = (time: string) => {
    setCheckInTime(time)
    
    // Clear error when user selects a time
    if (errors.checkInTime) {
      setErrors(prev => ({ ...prev, checkInTime: undefined }))
    }
  }

  const validateForm = () => {
    try {
      reservationSchema.parse({
        customerName,
        customerPhone,
        numberOfPeople,
        tableIds: selectedTables,
        checkInDate: checkInDate as Date,
        checkInTime
      })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  // Xử lý lỗi API chi tiết
  const handleApiError = (error: any) => {
    // Bắt định dạng lỗi từ API
    let errorMsg = "Không thể tạo đặt bàn. Vui lòng thử lại.";
    console.error("API Error:", error);
    
    if (error?.data) {
      // Trường hợp đặc biệt: httpStatus 422 với error là object
      // Ví dụ: {"data": null, "message": null, "httpStatus": 422, "timestamp": "...", "error": {"schedule": "Bạn không có lịch làm việc trong thời gian hiện tại."}}
      if (error.data.httpStatus === 422 && error.data.error && typeof error.data.error === 'object') {
        const validationErrors = Object.entries(error.data.error);
        if (validationErrors.length > 0) {
          const [field, message] = validationErrors[0];
          errorMsg = String(message);
          toast.error(errorMsg, {
            duration: 5000,
          });
          return;
        }
      }
      
      // Trường hợp 1: Lỗi nằm trong error object như ví dụ {"": "Số người không được vượt quá số chỗ của bàn"}
      if (error.data.error && typeof error.data.error === 'object') {
        const errorEntries = Object.entries(error.data.error);
        if (errorEntries.length > 0) {
          errorMsg = String(errorEntries[0][1]);
          toast.error(errorMsg, {
            description: "Vui lòng kiểm tra lại thông tin đặt bàn",
            duration: 5000,
          });
          return;
        }
      }
      
      // Trường hợp 2: error là một string
      if (error.data.error && typeof error.data.error === 'string') {
        errorMsg = error.data.error;
        toast.error(errorMsg, {
          description: "Vui lòng kiểm tra lại thông tin đặt bàn",
          duration: 5000,
        });
        return;
      }
      
      // Trường hợp 3: Thông báo lỗi nằm trong message
      if (error.data.message && error.data.message !== 'null' && error.data.message !== null) {
        errorMsg = String(error.data.message);
        toast.error(errorMsg, {
          description: "Vui lòng kiểm tra lại thông tin đặt bàn",
          duration: 5000,
        });
        return;
      }
      
      // Trường hợp 4: Tìm thông tin lỗi trong trường khác
      for (const key in error.data) {
        if (
          key !== 'timestamp' && 
          key !== 'httpStatus' && 
          key !== 'data' && 
          error.data[key] !== null && 
          error.data[key] !== undefined
        ) {
          const value = error.data[key];
          if (typeof value === 'string') {
            errorMsg = value;
            toast.error(errorMsg, {
              description: "Vui lòng kiểm tra lại thông tin đặt bàn",
              duration: 5000,
            });
            return;
          } else if (typeof value === 'object') {
            // Đối với lỗi lồng nhau
            const nestedEntries = Object.entries(value);
            if (nestedEntries.length > 0) {
              errorMsg = String(nestedEntries[0][1]);
              toast.error(errorMsg, {
                description: "Vui lòng kiểm tra lại thông tin đặt bàn",
                duration: 5000,
              });
              return;
            }
          }
        }
      }
    }
    
    // Mặc định trả về thông báo chung
    toast.error(errorMsg, {
      description: "Đã xảy ra lỗi khi tạo đặt bàn. Vui lòng thử lại sau.",
      duration: 5000,
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin đặt bàn", {
        description: "Hãy điền đầy đủ thông tin theo yêu cầu",
        duration: 4000,
      })
      return
    }

    setIsSubmitting(true)

    // Format the date and time for the API - Đảm bảo ngày không bị ảnh hưởng bởi múi giờ
    const year = checkInDate!.getFullYear()
    const month = String(checkInDate!.getMonth() + 1).padStart(2, '0')
    const day = String(checkInDate!.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    const timeStr = checkInTime + ":00"
    const checkInDateTime = `${dateStr}T${timeStr}.000Z`

    const reservationData: Reservation = {
      customerName,
      customerPhone,
      checkIn: checkInDateTime,
      tableIds: selectedTables,
      numberOfPeople,
      reservationTime: null
    }

    try {
      await createReservation(reservationData).unwrap()
      toast.success("Đã tạo đặt bàn thành công.", {
        description: `Đã đặt bàn cho khách hàng ${customerName} vào lúc ${checkInTime} ngày ${format(checkInDate!, "dd/MM/yyyy", { locale: vi })}`,
        duration: 4000,
      })
      router.push("/quan-ly/reservation")
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-2">
          ← Quay lại Đặt bàn
        </Button>
        <h1 className="text-3xl font-bold">Thêm đặt bàn</h1>
        <p className="text-muted-foreground">Tạo đặt bàn mới</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
              <CardDescription>Nhập thông tin khách hàng cho đặt bàn này</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên khách hàng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Nhập họ tên"
                  value={customerName}
                  onChange={(e) => handleInputChange(e, 'customerName')}
                  required
                  className={errors.customerName ? "border-red-500" : ""}
                  maxLength={50}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-500">{errors.customerName}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {customerName.length}/50 ký tự
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="Nhập số điện thoại"
                  value={customerPhone}
                  onChange={(e) => handleInputChange(e, 'customerPhone')}
                  required
                  className={errors.customerPhone ? "border-red-500" : ""}
                  maxLength={11}
                />
                {errors.customerPhone && (
                  <p className="text-sm text-red-500">{errors.customerPhone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="people">
                  Số người <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="people"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Nhập số người"
                  value={numberOfPeople}
                  onChange={(e) => handleInputChange(e, 'numberOfPeople')}
                  required
                  className={errors.numberOfPeople ? "border-red-500" : ""}
                />
                {errors.numberOfPeople && (
                  <p className="text-sm text-red-500">{errors.numberOfPeople}</p>
                )}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Ngày <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !checkInDate && "text-muted-foreground",
                          errors.checkInDate && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkInDate ? format(checkInDate, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={checkInDate || undefined}
                        onSelect={handleDateChange}
                        initialFocus
                        locale={vi}
                        disabled={(date) => {
                          return isBefore(date, today) || isBefore(maxDate, date)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.checkInDate && (
                    <p className="text-sm text-red-500">{errors.checkInDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Thời gian <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={checkInTime} 
                    onValueChange={handleTimeChange} 
                    disabled={!checkInDate || availableTimes.length === 0}
                  >
                    <SelectTrigger className={errors.checkInTime ? "border-red-500" : ""}>
                      <SelectValue placeholder={availableTimes.length ? "Chọn thời gian" : "Không có thời gian khả dụng"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.checkInTime && (
                    <p className="text-sm text-red-500">{errors.checkInTime}</p>
                  )}
                  {checkInDate && isToday(checkInDate) && availableTimes.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">Không có khung giờ khả dụng cho ngày hôm nay</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Chọn bàn <span className="text-red-500">*</span>
              </CardTitle>
              <CardDescription>
                {checkInDate 
                  ? "Chọn một hoặc nhiều bàn cho đặt bàn này" 
                  : "Vui lòng chọn ngày để xem bàn khả dụng"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!checkInDate ? (
                <div className="p-8 text-center border-2 border-dashed rounded-lg">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-2">Chọn ngày để xem bàn khả dụng</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="flex space-x-2 mb-2">
                      <Badge variant="outline" className="bg-green-100 border-green-300">
                        Khả dụng
                      </Badge>
                      <Badge variant="outline" className="bg-red-100 border-red-300">
                        Không khả dụng
                      </Badge>
                      <Badge variant="outline" className="bg-blue-100 border-blue-300">
                        Đã chọn
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Nhấp vào bàn khả dụng để chọn</p>
                  </div>

                  {isLoadingTables ? (
                    <div className="p-8 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Đang tải danh sách bàn...</p>
                    </div>
                  ) : availableTables.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">Không có bàn khả dụng cho ngày đã chọn</p>
                    </div>
                  ) : (
                    <div className={cn(
                      "grid grid-cols-4 gap-2",
                      errors.tableIds && "border-red-500 p-2 rounded-md"
                    )}>
                      {availableTables.map((table) => {
                        const isSelected = selectedTables.includes(table.id)
                        // Bàn chỉ khả dụng nếu status là AVAILABLE
                        const isAvailable = table.status === "AVAILABLE"

                        return (
                          <button
                            key={table.id}
                            type="button"
                            onClick={() => isAvailable && toggleTableSelection(table.id)}
                            disabled={!isAvailable}
                            className={cn(
                              "border rounded-md p-3 text-center transition-all",
                              getTableStatusClass(isAvailable),
                              isSelected && "bg-blue-100 border-blue-300 ring-2 ring-blue-400",
                            )}
                          >
                            <div className="font-medium">{table.tableNumber}</div>
                            <div className="text-xs text-muted-foreground">Sức chứa: {table.capacity} người</div>
                            <div className="text-xs mt-1">
                              {isAvailable ? (
                                <span className="text-green-600">Khả dụng</span>
                              ) : (
                                <span className="text-red-600">Đã đặt</span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {errors.tableIds && (
                    <p className="text-sm text-red-500 mt-2">{errors.tableIds}</p>
                  )}

                  <div className="mt-4">
                    <p className="text-sm">
                      Đã chọn:{" "}
                      {selectedTables.length
                        ? selectedTables
                            .map((id) => {
                              const table = availableTables.find((t) => t.id === id)
                              return table?.tableNumber
                            })
                            .join(", ")
                        : "Chưa chọn bàn"}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isCreating}
              >
                {(isSubmitting || isCreating) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  "Tạo đặt bàn"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}

