"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueChart } from "./revenue-chart";
import { SummaryCards } from "./summary-cards";
import { 
  useGetDishDetailsQuery,
  useGetTopSellingDishesLastHourQuery,
  useGetTotalDishSoldQuery,
  useGetRevenueTodayQuery, 
  useGetWeeklyRevenueQuery, 
  useGetLastThreeMonthsRevenueQuery,
  useGetLastThreeYearsRevenueQuery 
} from "@/features/statistics/statisticsApiSlice";
import { Dish } from "@/features/statistics/types";
import TopDishes from "./top-dishes";
import TopSellingDishes from "./top-selling-dishes";

type TimeFrameType = 'daily' | 'monthly' | 'yearly';

export default function Dashboard() {
  const [timeFrame, setTimeFrame] = useState<TimeFrameType>("daily");

  // Lấy dữ liệu từ API chi tiết món ăn bán được
  const { data: dishDetailsData, isLoading: isDishDetailsLoading, error: dishDetailsError } = useGetDishDetailsQuery();
  // Xử lý và sắp xếp dữ liệu để lấy top món bán chạy trong ngày
  const dishes: Dish[] = dishDetailsData?.data || [];
  const topDishes = [...dishes].sort((a, b) => b.totalQuantity - a.totalQuantity);

  // Lấy dữ liệu từ API top-selling-dishes/last-hour
  const { data: topDishesLastHourData, isLoading: isTopDishesLastHourLoading, error: topDishesLastHourError } = useGetTopSellingDishesLastHourQuery();
  const topDishesLastHour: Dish[] = topDishesLastHourData?.data || [];

  // Lấy dữ liệu về tổng số món bán trong ngày
  const { data: totalDishSoldData, isLoading: isTotalDishSoldLoading, error: totalDishSoldError } = useGetTotalDishSoldQuery();
  const totalDishesToday = totalDishSoldData?.data?.totalDishSold || 0;

  // Lấy dữ liệu từ API revenue/today
  const { data: revenueTodayData, isLoading: isRevenueLoading, error: revenueError } = useGetRevenueTodayQuery();
  const totalRevenueToday = revenueTodayData?.data || 0;

  // Lấy dữ liệu từ API revenue/weekly
  const { data: weeklyRevenueData, isLoading: isWeeklyLoading, error: weeklyError } = useGetWeeklyRevenueQuery();
  const weeklyRevenue = weeklyRevenueData?.data || [];

  // Lấy dữ liệu từ API revenue/last-three-months
  const { data: lastThreeMonthsData, isLoading: isLastThreeMonthsLoading, error: lastThreeMonthsError } = useGetLastThreeMonthsRevenueQuery();
  const monthlyRevenue = lastThreeMonthsData?.data || [];

  // Lấy dữ liệu từ API revenue/last-three-years
  const { data: lastThreeYearsData, isLoading: isLastThreeYearsLoading, error: lastThreeYearsError } = useGetLastThreeYearsRevenueQuery();
  const yearlyRevenue = lastThreeYearsData?.data || [];

  // Format currency in VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  // Get revenue data based on selected time frame
  const getRevenueData = () => {
    switch (timeFrame) {
      case "daily":
        return weeklyRevenue.map(item => ({ date: item.date, revenue: item.totalRevenue }));
      case "monthly":
        return monthlyRevenue.map(item => ({ date: item.date, revenue: item.totalRevenue }));
      case "yearly":
        return yearlyRevenue.map(item => ({ date: item.date, revenue: item.totalRevenue }));
      default:
        return weeklyRevenue.map(item => ({ date: item.date, revenue: item.totalRevenue }));
    }
  };

  // Format date based on time frame
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Không có dữ liệu";
    
    switch (timeFrame) {
      case "daily":
        return new Date(dateStr).toLocaleDateString("vi-VN");
      case "monthly":
        try {
          const [year, month] = dateStr.split("-");
          return `Tháng ${month}/${year}`;
        } catch (error) {
          console.log("Lỗi định dạng date:", dateStr);
          return dateStr;
        }
      case "yearly":
        try {
          // Lấy năm từ chuỗi ngày "2023-01-01"
          const year = dateStr.split("-")[0];
          return `Năm ${year}`;
        } catch (error) {
          console.log("Lỗi định dạng date năm:", dateStr);
          return dateStr;
        }
      default:
        return dateStr;
    }
  };

  const revenueData = getRevenueData();
  const maxRevenue = Math.max(...revenueData.map(item => item.revenue), 0);

  // Kiểm tra trạng thái loading và error cho tất cả API doanh thu
  if (isRevenueLoading || isTotalDishSoldLoading || isDishDetailsLoading || isWeeklyLoading || isLastThreeMonthsLoading || isLastThreeYearsLoading) 
    return <div className="p-2 flex justify-center items-center min-h-[300px]">
      <div className="animate-pulse flex items-center gap-2">
        <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <span className="text-sm text-muted-foreground">Đang tải...</span>
      </div>
    </div>;
  
  if (revenueError || totalDishSoldError || dishDetailsError || weeklyError || lastThreeMonthsError || lastThreeYearsError) 
    return <div className="p-2 text-red-500 text-center text-sm">Đã có lỗi xảy ra khi tải dữ liệu.</div>;

  return (
    <div className="p-2 md:p-3 lg:p-6 space-y-3 md:space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Thống Kê Nhà Hàng</h1>
        <div className="w-full md:w-auto">
          <Tabs value={timeFrame} onValueChange={(value: string) => setTimeFrame(value as TimeFrameType)} className="w-full md:w-[400px]">
            <TabsList className="grid w-full grid-cols-3 h-9">
              <TabsTrigger value="daily" className="text-xs md:text-sm">Ngày</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs md:text-sm">Tháng</TabsTrigger>
              <TabsTrigger value="yearly" className="text-xs md:text-sm">Năm</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <SummaryCards
        totalRevenueToday={totalRevenueToday}
        totalDishesToday={totalDishesToday}
        topDishName={topDishes[0]?.dishName || "Không có dữ liệu"}
        topDishCount={topDishes[0]?.totalQuantity || 0}
        maxRevenue={maxRevenue}
        formatCurrency={formatCurrency}
        timeFrame={timeFrame}
      />

      <Card className="overflow-hidden">
        <CardHeader className="p-3 md:p-4 lg:p-6">
          <CardTitle className="text-sm md:text-lg lg:text-xl">
            Doanh Thu Theo{" "}
            {timeFrame === "daily"
              ? "Ngày"
              : timeFrame === "monthly"
              ? "Tháng"
              : "Năm"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-1 md:px-2 overflow-x-auto pb-3">
          <div className="min-w-[500px] md:min-w-0">
            <RevenueChart
              data={revenueData}
              timeFrame={timeFrame}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-6">
        <TopSellingDishes />
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-6 lg:grid-cols-2">
        <TopDishes formatCurrency={formatCurrency} />
      </div>
    </div>
  );
}
