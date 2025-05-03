"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { format, subDays, isSameDay } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, Clock, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react"
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
import { HourlyTopDishesResponse, HourlyTopDish, Dish } from "@/features/statistics/types"
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
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Kiểm tra kích thước màn hình trên client-side
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Kiểm tra ban đầu
    checkIfMobile();
    
    // Thêm event listener cho resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Prepare query parameters based on selected date range
  const getQueryParams = useCallback(() => {
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
  }, [date.from, date.to, dateRange]);

  // Use RTK Query hook
  const { data: apiData, isLoading, error: apiError } = useGetHourlyTopDishesQuery(getQueryParams(), {
    // Re-fetch when date range changes
    skip: false,
  });

  const data = useMemo(() => {
    const rawData = apiData?.data || [];
    // Sắp xếp dữ liệu theo giờ
    return [...rawData].sort((a, b) => a.hour - b.hour);
  }, [apiData]);
  
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
    
    // Reset active index
    setActiveIndex(0);
  }

  // Fix for Calendar component
  const handleSelectDate = (range: CalendarDateRange | undefined) => {
    if (range) {
      setDate({
        from: range.from,
        to: range.to
      });
      setActiveIndex(0);
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
  
  // Xử lý điều hướng các khung giờ trên mobile
  const handlePrevious = () => {
    setActiveIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };
  
  const handleNext = () => {
    setActiveIndex((prevIndex) => Math.min(data.length - 1, prevIndex + 1));
  };

  return (
    <div className="space-y-3 md:space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-2 md:gap-3 md:flex-row md:justify-between md:items-center">
        <div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Món ăn bán chạy nhất</h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Thống kê 3 món ăn bán chạy nhất theo từng khung giờ</p>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto md:max-w-[320px]">
          <Tabs defaultValue="preset" className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-2 h-8 text-xs">
              <TabsTrigger value="preset">Nhanh</TabsTrigger>
              <TabsTrigger value="custom">Tùy chỉnh</TabsTrigger>
            </TabsList>
            <TabsContent value="preset" className="mt-2">
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Chọn khoảng thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today" className="text-xs">Hôm nay</SelectItem>
                  <SelectItem value="yesterday" className="text-xs">Hôm qua</SelectItem>
                  <SelectItem value="week" className="text-xs">7 ngày qua</SelectItem>
                  <SelectItem value="custom" className="text-xs">Tùy chỉnh</SelectItem>
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
                      size="sm"
                      className={cn("w-full justify-start text-left font-normal text-[10px] sm:text-xs h-8", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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
                      numberOfMonths={isMobile ? 1 : 2}
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
        <div className="flex justify-center p-3 sm:p-4 bg-destructive/10 rounded-lg">
          <p className="text-destructive text-xs sm:text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="mt-3 sm:mt-4 lg:mt-8">
          <div className="flex flex-col gap-3 items-center">
            <Skeleton className="h-[200px] sm:h-[300px] w-full rounded-lg" />
            <div className="flex gap-2 items-center">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {!data || data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 lg:py-12">
              <div className="rounded-full bg-muted/20 p-3 mb-4">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm lg:text-base text-center px-6">Không có dữ liệu cho khoảng thời gian này</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-xs h-8"
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
            <Card className="mt-3 sm:mt-4 lg:mt-8 border-muted/50 shadow-sm overflow-hidden">
              <CardContent className="pt-3 sm:pt-4 lg:pt-6 p-2 sm:p-4 lg:p-6">
                <div className="mb-2 md:mb-4">
                  <h3 className="text-xs sm:text-sm font-medium">
                    {date.from && format(date.from, "EEEE, dd/MM/yyyy", { locale: vi })}
                    {date.to && !isSameDay(date.from!, date.to) && (
                      <>
                        {" "}
                        <ArrowRight className="inline h-3 w-3 sm:h-4 sm:w-4" /> {format(date.to, "EEEE, dd/MM/yyyy", { locale: vi })}
                      </>
                    )}
                  </h3>
                </div>

                {/* Mobile Timeline with Pagination */}
                {isMobile && data.length > 0 && (
                  <div className="mt-2 sm:hidden">
                    <div className="flex items-center justify-between mb-3">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 rounded-full"
                        onClick={handlePrevious}
                        disabled={activeIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-xs font-medium flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                        {formatHour(data[activeIndex]?.hour || 0)}
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 rounded-full"
                        onClick={handleNext}
                        disabled={activeIndex === data.length - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Single TimePoint Content */}
                    <div className="mt-2 border border-muted rounded-lg p-3 bg-card/50">
                      {data[activeIndex]?.topDishes.length > 0 ? (
                        <div className="space-y-2">
                          {data[activeIndex]?.topDishes.map((dish, dishIndex) => (
                            <div 
                              key={dish.dishId} 
                              className={cn(
                                "text-left border rounded-lg p-2 shadow-sm hover:shadow-md transition-all",
                                dishIndex === 0 ? "border-primary/20 bg-primary/5" : ""
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn(
                                  "h-5 w-5 rounded-full flex items-center justify-center p-0",
                                  dishIndex === 0 ? "bg-amber-100 text-amber-700 border-amber-200" :
                                  dishIndex === 1 ? "bg-slate-100 text-slate-700 border-slate-200" :
                                  "bg-zinc-100 text-zinc-700 border-zinc-200"
                                )}>
                                  {dishIndex + 1}
                                </Badge>
                                <div className="font-medium text-xs line-clamp-1">{dish.dishName}</div>
                              </div>
                              <div className="flex justify-between items-center mt-2 text-[10px]">
                                <Badge variant="outline" className="text-[10px]">
                                  {formatCurrency(dish.dishPrice)}
                                </Badge>
                                <div className="text-[10px]">
                                  Đã bán:{" "}
                                  <span className={cn("text-[10px] rounded px-1 py-0.5", getDishColor(dish.dishId))}>
                                    {dish.totalQuantity}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground text-[10px] py-4">
                          Không có dữ liệu
                        </div>
                      )}
                      <div className="flex justify-center mt-3">
                        <div className="flex gap-1">
                          {data.map((_, index) => (
                            <div 
                              key={index}
                              className={cn(
                                "h-1.5 rounded-full transition-all", 
                                index === activeIndex 
                                  ? "w-4 bg-primary" 
                                  : "w-1.5 bg-muted-foreground/30"
                              )}
                              onClick={() => setActiveIndex(index)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Desktop Timeline visualization */}
                <div className={cn("relative mt-4 pb-6 overflow-x-auto", isMobile && "hidden")}>
                  {/* Timeline line */}
                  <div className="absolute left-0 right-0 h-0.5 top-6 bg-muted" />

                  {/* Timeline points */}
                  <div className="relative">
                    <div className="flex flex-nowrap justify-between min-w-[600px] md:min-w-0">
                      {data.map((hourData, index) => (
                        <div
                          key={hourData.hour}
                          className={cn(
                            "flex flex-col items-center mb-6 md:mb-0",
                            index === 0 ? "ml-0" : "",
                            index === data.length - 1 ? "mr-0" : "",
                          )}
                          style={{
                            minWidth: "110px",
                            width: `${100 / Math.min(data.length, 6)}%`,
                            maxWidth: "150px",
                          }}
                        >
                          <div className="text-xs sm:text-sm text-muted-foreground mb-2 flex items-center sticky top-0 bg-background z-10">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatHour(hourData.hour)}
                          </div>

                          {/* Hiển thị tối đa 3 món trong topDishes */}
                          <div className="mt-4 flex flex-col gap-2 w-full">
                            {hourData.topDishes.map((dish, dishIndex) => (
                              <div 
                                key={dish.dishId} 
                                className={cn(
                                  "text-center border rounded-lg p-1.5 sm:p-2 shadow-sm hover:shadow-md transition-all",
                                  dishIndex === 0 ? "border-primary/20 bg-primary/5" : ""
                                )}
                              >
                                <div className="font-medium text-[10px] sm:text-xs line-clamp-1 mb-1">{dish.dishName}</div>
                                <Badge variant="outline" className="mb-1 text-[9px] sm:text-[10px]">
                                  {formatCurrency(dish.dishPrice)}
                                </Badge>
                                <div className="text-[9px] sm:text-[10px] mt-1">
                                  Đã bán:{" "}
                                  <span className={cn("text-[9px] sm:text-[10px] rounded px-1 py-0.5", getDishColor(dish.dishId))}>
                                    {dish.totalQuantity}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {hourData.topDishes.length === 0 && (
                              <div className="text-center text-muted-foreground text-[9px] sm:text-[10px]">
                                Không có dữ liệu
                              </div>
                            )}
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
