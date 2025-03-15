import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryCardsProps {
  totalRevenueToday: number
  totalDishesToday: number
  topDishName: string
  topDishCount: number
  maxRevenue: number
  formatCurrency: (amount: number) => string
}

export function SummaryCards({
  totalRevenueToday,
  totalDishesToday,
  topDishName,
  topDishCount,
  maxRevenue,
  formatCurrency,
}: SummaryCardsProps) {
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
          <CardTitle className="text-sm font-medium">Món Bán Chạy Nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topDishName}</div>
          <p className="text-xs text-muted-foreground">{topDishCount} món</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Doanh Thu Cao Nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(maxRevenue)}</div>
        </CardContent>
      </Card>
    </div>
  )
}

