"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { vi } from "date-fns/locale"

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

export default function NewReservationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [checkInDate, setCheckInDate] = useState<Date | null>(null)
  const [checkInTime, setCheckInTime] = useState("12:00")
  const [numberOfPeople, setNumberOfPeople] = useState<number>(2)
  const [selectedTables, setSelectedTables] = useState<number[]>([])

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

  // Reset selected tables when date changes
  useEffect(() => {
    setSelectedTables([])
  }, [checkInDate])

  const toggleTableSelection = (tableId: number) => {
    setSelectedTables((prev) => (prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]))
  }

  const getTableStatusClass = (isAvailable: boolean) => {
    return isAvailable 
      ? "bg-green-100 border-green-300 hover:bg-green-200"
      : "bg-red-100 border-red-300 cursor-not-allowed opacity-70"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName || !customerPhone || selectedTables.length === 0 || !checkInDate) {
      toast.error("Vui lòng điền đầy đủ thông tin và chọn ít nhất một bàn.")
      return
    }

    setIsSubmitting(true)

    // Format the date and time for the API - Đảm bảo ngày không bị ảnh hưởng bởi múi giờ
    const year = checkInDate.getFullYear()
    const month = String(checkInDate.getMonth() + 1).padStart(2, '0')
    const day = String(checkInDate.getDate()).padStart(2, '0')
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
      toast.success("Đã tạo đặt bàn thành công.")
      router.push("/quan-ly/reservation")
    } catch (error) {
      console.error("Lỗi khi tạo đặt bàn:", error)
      toast.error("Không thể tạo đặt bàn. Vui lòng thử lại.")
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
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="Nhập số điện thoại"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="people">
                  Số người <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="people"
                  type="number"
                  min="1"
                  placeholder="Nhập số người"
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(Number.parseInt(e.target.value) || 1)}
                  required
                />
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
                        onSelect={(date) => setCheckInDate(date ? date : null)}
                        initialFocus
                        locale={vi}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>
                    Thời gian <span className="text-red-500">*</span>
                  </Label>
                  <Select value={checkInTime} onValueChange={setCheckInTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thời gian" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "10:00",
                        "10:30",
                        "11:00",
                        "11:30",
                        "12:00",
                        "12:30",
                        "13:00",
                        "13:30",
                        "14:00",
                        "14:30",
                        "15:00",
                        "15:30",
                        "16:00",
                        "16:30",
                        "17:00",
                        "17:30",
                        "18:00",
                        "18:30",
                        "19:00",
                        "19:30",
                        "20:00",
                        "20:30",
                        "21:00",
                      ].map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <div className="grid grid-cols-4 gap-2">
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
                disabled={isSubmitting || isCreating || !checkInDate || selectedTables.length === 0}
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

