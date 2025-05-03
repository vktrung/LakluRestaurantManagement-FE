import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryCardsProps {
  totalRevenueToday: number
  totalDishesToday: number
  topDishName: string
  topDishCount: number
  maxRevenue: number
  formatCurrency: (amount: number) => string
  timeFrame?: 'daily' | 'monthly' | 'yearly'
}

export function SummaryCards({
  totalRevenueToday,
  totalDishesToday,
  topDishName,
  topDishCount,
  maxRevenue,
  formatCurrency,
  timeFrame = 'daily',
}: SummaryCardsProps) {
  
  // Xác định tiêu đề cho thẻ doanh thu cao nhất dựa trên timeFrame
  const getMaxRevenueTitle = () => {
    switch (timeFrame) {
      case 'daily':
        return 'Doanh Thu Cao Nhất Trong Tuần'
      case 'monthly':
        return 'Doanh Thu Cao Nhất Trong 3 Tháng'
      case 'yearly':
        return 'Doanh Thu Cao Nhất Trong 3 Năm'
      default:
        return 'Doanh Thu Cao Nhất'
    }
  }

  return (
    <div className="grid gap-2 md:gap-3 lg:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between py-2 px-2 sm:p-3 md:p-4 md:pb-2">
          <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium line-clamp-1">Tổng Doanh Thu Hôm Nay</CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-2 sm:p-3 md:p-4 md:pt-1">
          <div className="text-xs sm:text-base md:text-2xl font-bold line-clamp-1 text-blue-700">{formatCurrency(totalRevenueToday)}</div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden bg-gradient-to-br from-white to-green-50 border border-green-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between py-2 px-2 sm:p-3 md:p-4 md:pb-2">
          <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium line-clamp-1">Tổng Món Bán Hôm Nay</CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-2 sm:p-3 md:p-4 md:pt-1">
          <div className="text-xs sm:text-base md:text-2xl font-bold text-green-700">{totalDishesToday}</div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden bg-gradient-to-br from-white to-amber-50 border border-amber-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between py-2 px-2 sm:p-3 md:p-4 md:pb-2">
          <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium line-clamp-1">Món Bán Chạy Nhất Hôm Nay</CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-2 sm:p-3 md:p-4 md:pt-1">
          <div className="text-xs sm:text-base md:text-2xl font-bold line-clamp-1 text-amber-700">{topDishName}</div>
          <p className="text-[9px] sm:text-xs text-muted-foreground">{topDishCount} món</p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden bg-gradient-to-br from-white to-purple-50 border border-purple-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between py-2 px-2 sm:p-3 md:p-4 md:pb-2">
          <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium line-clamp-1">{getMaxRevenueTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-2 sm:p-3 md:p-4 md:pt-1">
          <div className="text-xs sm:text-base md:text-2xl font-bold line-clamp-1 text-purple-700">{formatCurrency(maxRevenue)}</div>
        </CardContent>
      </Card>
    </div>
  )
}

