"use client"

import { useState } from "react"
import { format, subDays, isSameDay } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetHourlyTopDishesQuery } from "@/features/statistics/statisticsApiSlice"
import { HourlyTopDishesResponse, HourlyTopDish } from "@/features/statistics/types"
import { DateRange as CalendarDateRange } from "react-day-picker"

// Chỉ giữ lại các type không có sẵn trong API type
type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

// Các tùy chọn khoảng thời gian
type TimeRangeOption = "today" | "yesterday" | "week" | "custom";

export default function TopSellingDishes() {
  const [date, setDate] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  })
  const [dateRange, setDateRange] = useState<TimeRangeOption>("today")
  
  // Prepare query parameters based on selected date range
  const getQueryParams = () => {
    if (dateRange === "custom" && date.from) {
      const params: { startDate?: string; endDate?: string } = {
        startDate: format(date.from, "yyyy-MM-dd")
      }
      if (date.to) {
        params.endDate = format(date.to, "yyyy-MM-dd")
      }
      return params
    } else if (dateRange === "yesterday") {
      const yesterday = subDays(new Date(), 1)
      return { startDate: format(yesterday, "yyyy-MM-dd") }
    } else if (dateRange === "week") {
      const weekAgo = subDays(new Date(), 7)
      return { 
        startDate: format(weekAgo, "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd")
      }
    }
    // Default: today
    return { startDate: format(new Date(), "yyyy-MM-dd") }
  }

  // Use RTK Query hook
  const { data: apiData, isLoading, error: apiError } = useGetHourlyTopDishesQuery(getQueryParams(), {
    // Re-fetch when date range changes
    skip: false,
  });

  const data = apiData?.data || [];
  const error = apiError ? "Không thể tải dữ liệu. Vui lòng thử lại sau." : null;

  const handleDateRangeChange = (value: string) => {
    setDateRange(value as TimeRangeOption)

    if (value === "today") {
      setDate({
        from: new Date(),
        to: new Date(),
      })
    } else if (value === "yesterday") {
      const yesterday = subDays(new Date(), 1)
      setDate({
        from: yesterday,
        to: yesterday,
      })
    } else if (value === "week") {
      setDate({
        from: subDays(new Date(), 7),
        to: new Date(),
      })
    }
  }

  // Fix for Calendar component
  const handleSelectDate = (range: CalendarDateRange | undefined) => {
    if (range) {
      setDate({
        from: range.from,
        to: range.to
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const formatHour = (hour: number) => {
    return `${hour}:00`
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  const getDishColor = (dishId: number) => {
    // Generate a consistent color based on dishId
    const colors = [
      "bg-red-100 text-red-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
    ]
    return colors[dishId % colors.length]
  }

  const getDishBgColor = (dishId: number) => {
    // Generate a consistent background color based on dishId
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ]
    return colors[dishId % colors.length]
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Món ăn bán chạy nhất</h2>
          <p className="text-muted-foreground">Thống kê món ăn bán chạy nhất theo từng khung giờ</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Tabs defaultValue="preset" className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preset">Nhanh</TabsTrigger>
              <TabsTrigger value="custom">Tùy chỉnh</TabsTrigger>
            </TabsList>
            <TabsContent value="preset" className="mt-2">
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Chọn khoảng thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hôm nay</SelectItem>
                  <SelectItem value="yesterday">Hôm qua</SelectItem>
                  <SelectItem value="week">7 ngày qua</SelectItem>
                  <SelectItem value="custom">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>
            <TabsContent value="custom" className="mt-2">
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                            {format(date.to, "dd/MM/yyyy", { locale: vi })}
                          </>
                        ) : (
                          format(date.from, "dd/MM/yyyy", { locale: vi })
                        )
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={handleSelectDate}
                      numberOfMonths={2}
                      locale={vi}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {error && (
        <div className="flex justify-center p-6 bg-destructive/10 rounded-lg">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="mt-8">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      ) : (
        <>
          {!data || data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-lg">Không có dữ liệu cho khoảng thời gian này</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setDateRange("today")
                  setDate({
                    from: new Date(),
                    to: new Date(),
                  })
                }}
              >
                Xem dữ liệu hôm nay
              </Button>
            </div>
          ) : (
            <Card className="mt-8">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">
                    {date.from && format(date.from, "EEEE, dd/MM/yyyy", { locale: vi })}
                    {date.to && !isSameDay(date.from!, date.to) && (
                      <>
                        {" "}
                        <ArrowRight className="inline h-4 w-4" /> {format(date.to, "EEEE, dd/MM/yyyy", { locale: vi })}
                      </>
                    )}
                  </h3>
                </div>

                {/* Timeline visualization */}
                <div className="relative mt-8 pb-10">
                  {/* Timeline line */}
                  <div className="absolute left-0 right-0 h-0.5 top-6 bg-muted" />

                  {/* Timeline points */}
                  <div className="relative">
                    <div className="flex justify-between">
                      {[...data]
                        .sort((a, b) => a.hour - b.hour)
                        .map((hourData, index) => (
                          <div
                            key={hourData.hour}
                            className={cn(
                              "flex flex-col items-center",
                              index === 0 ? "ml-0" : "",
                              index === data.length - 1 ? "mr-0" : "",
                            )}
                            style={{
                              width: `${100 / data.length}%`,
                              maxWidth: "150px",
                            }}
                          >
                            <div className="text-sm text-muted-foreground mb-2 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatHour(hourData.hour)}
                            </div>

                            <div className="mt-4 text-center">
                              <div className="font-medium line-clamp-1">{hourData.topDish.dishName}</div>
                              <Badge variant="outline" className="mt-1">
                                {formatCurrency(hourData.topDish.dishPrice)}
                              </Badge>
                              <div className="mt-2 text-sm font-medium">Đã bán: {hourData.topDish.totalQuantity}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
