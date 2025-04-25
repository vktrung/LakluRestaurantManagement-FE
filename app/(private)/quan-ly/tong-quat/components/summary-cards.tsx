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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tổng Doanh Thu Hôm Nay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenueToday)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tổng Món Bán Hôm Nay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDishesToday}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Món Bán Chạy Nhất Hôm Nay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topDishName}</div>
          <p className="text-xs text-muted-foreground">{topDishCount} món</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{getMaxRevenueTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(maxRevenue)}</div>
        </CardContent>
      </Card>
    </div>
  )
}

