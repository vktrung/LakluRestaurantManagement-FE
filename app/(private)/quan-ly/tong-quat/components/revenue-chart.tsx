"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number }>;
  timeFrame: string;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
}

export function RevenueChart({ data, timeFrame, formatDate, formatCurrency }: RevenueChartProps) {
  // Transform data for the chart
  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    revenue: item.revenue,
    formattedRevenue: formatCurrency(item.revenue),
  }))

  // Custom tooltip to display formatted currency
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-primary">Doanh thu: {payload[0].payload.formattedRevenue}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
          <YAxis tickFormatter={(value) => formatCurrency(value).split(" ")[0]} width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            name="Doanh thu" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
