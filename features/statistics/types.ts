export interface Dish {
    dishId: number;
    dishName: string;
    dishDescription: string;
    dishPrice: number;
    totalQuantity: number;
  }
  
  export interface TopDishesResponse {
    data: Dish[];
    message: string;
    httpStatus: number;
    timestamp: string;
    error: string | null;
  }
  
  export interface RevenueTodayResponse {
    data: number; // Doanh thu hôm nay
    message: string;
    httpStatus: number;
    timestamp: string;
    error: string | null;
  }
  
  export interface WeeklyRevenueItem {
    date: string;
    totalRevenue: number;
  }
  
  export interface WeeklyRevenueResponse {
    data: WeeklyRevenueItem[];
    message: string;
    httpStatus: number;
    timestamp: string;
    error: string | null;
  }
  
  // Thêm interface mới cho dữ liệu 3 tháng gần nhất
  export interface MonthlyRevenueItem {
    date: string;
    totalRevenue: number;
  }
  
  export interface LastThreeMonthsRevenueResponse {
    data: MonthlyRevenueItem[];
    message: string;
    httpStatus: number;
    timestamp: string;
    error: string | null;
  }

  export interface YearlyRevenueItem {
    date: string;
    totalRevenue: number;
  }
  
  export interface LastThreeYearsRevenueResponse {
    data: YearlyRevenueItem[];
    message: string;
    httpStatus: number;
    timestamp: string;
    error: string | null;
  }
  
  export interface TotalDishSoldData {
    totalDishSold: number;
    totalDishTypes: number;
  }
  
  export interface TotalDishSoldResponse {
    data: TotalDishSoldData;
    message: string;
    httpStatus: number;
    timestamp: string;
    error: string | null;
  }
  
  export interface DishDetailResponse {
    data: Dish[];
    message: string;
    httpStatus: number;
    timestamp: string;
    error: string | null;
  }
  