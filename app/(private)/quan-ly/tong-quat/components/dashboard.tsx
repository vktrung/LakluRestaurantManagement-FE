"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueChart } from "./revenue-chart";
import { SummaryCards } from "./summary-cards";
import { 
  useGetTopSellingDishesQuery, 
  useGetRevenueTodayQuery, 
  useGetWeeklyRevenueQuery, 
  useGetLastThreeMonthsRevenueQuery,
  useGetLastThreeYearsRevenueQuery 
} from "@/features/statistics/statisticsApiSlice";
import { Dish } from "@/features/statistics/types";
import TopDishes from "./top-dishes";

export default function Dashboard() {
  const [timeFrame, setTimeFrame] = useState("daily");

  // Lấy dữ liệu từ API top-selling-dishes
  const { data: topDishesData, isLoading: isTopDishesLoading, error: topDishesError } = useGetTopSellingDishesQuery();
  const topDishes: Dish[] = topDishesData?.data || [];

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

  // Kiểm tra trạng thái loading và error cho tất cả API
  if (isTopDishesLoading || isRevenueLoading || isWeeklyLoading || isLastThreeMonthsLoading || isLastThreeYearsLoading) 
    return <div className="p-4">Loading...</div>;
  
  if (topDishesError || revenueError || weeklyError || lastThreeMonthsError || lastThreeYearsError) 
    return <div className="p-4 text-red-500">Đã có lỗi xảy ra.</div>;

  // Mock data cho totalDishesToday
  const mockData = {
    totalDishesToday: 342,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Thống Kê Nhà Hàng</h1>
        <Tabs value={timeFrame} onValueChange={setTimeFrame} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Ngày</TabsTrigger>
            <TabsTrigger value="monthly">Tháng</TabsTrigger>
            <TabsTrigger value="yearly">Năm</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <SummaryCards
        totalRevenueToday={totalRevenueToday}
        totalDishesToday={mockData.totalDishesToday}
        topDishName={topDishes[0]?.dishName || "Không có dữ liệu"}
        topDishCount={topDishes[0]?.totalQuantity || 0}
        maxRevenue={maxRevenue}
        formatCurrency={formatCurrency}
      />

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>
            Doanh Thu Theo{" "}
            {timeFrame === "daily"
              ? "Ngày"
              : timeFrame === "monthly"
              ? "Tháng"
              : "Năm"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <RevenueChart
            data={revenueData}
            timeFrame={timeFrame}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />
        </CardContent>
      </Card>

      <TopDishes
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
