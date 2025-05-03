"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useEffect, useState } from 'react'

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number }>;
  timeFrame: string;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
}

export function RevenueChart({ data, timeFrame, formatDate, formatCurrency }: RevenueChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Kiểm tra kích thước màn hình khi component được mount
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

  // Transform data for the chart
  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    revenue: item.revenue,
    formattedRevenue: formatCurrency(item.revenue),
  }))

  // Format large numbers in a shorter way for mobile
  const formatYAxisTick = (value: number): string => {
    if (isMobile) {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
      }
      return value.toString();
    }
    return formatCurrency(value).split(" ")[0];
  };

  // Custom tooltip to display formatted currency
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-1.5 sm:p-2 md:p-3 rounded-md shadow-md text-xs sm:text-sm">
          <p className="font-medium text-[10px] sm:text-xs">{label}</p>
          <p className="text-primary text-[10px] sm:text-xs">Doanh thu: {payload[0].payload.formattedRevenue}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[220px] sm:h-[250px] md:h-[300px] lg:h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData} 
          margin={{ 
            top: 5, 
            right: 5, 
            left: isMobile ? -15 : 0, 
            bottom: 5 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: isMobile ? 8 : 10, fill: 'var(--muted-foreground)' }} 
            tickMargin={5}
            interval={isMobile ? 'preserveStartEnd' : 0}
            height={isMobile ? 40 : 50}
            tickFormatter={(value) => {
              // Rút gọn text trên trục X cho màn hình mobile
              if (isMobile && value.length > 10) {
                if (timeFrame === 'monthly') {
                  return value.replace('Tháng ', 'T');
                } else if (timeFrame === 'yearly') {
                  return value.replace('Năm ', '');
                } else {
                  return value;
                }
              }
              return value;
            }}
          />
          <YAxis 
            tickFormatter={formatYAxisTick}
            width={isMobile ? 40 : 60}
            tick={{ fontSize: isMobile ? 8 : 10, fill: 'var(--muted-foreground)' }}
            tickCount={isMobile ? 3 : 5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              fontSize: isMobile ? '10px' : '12px', 
              marginTop: isMobile ? '5px' : '10px' 
            }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            name="Doanh thu" 
            stroke="hsl(var(--primary))" 
            strokeWidth={isMobile ? 1.5 : 2}
            dot={{ stroke: 'hsl(var(--primary))', strokeWidth: isMobile ? 1.5 : 2, r: isMobile ? 2 : 3 }}
            activeDot={{ stroke: 'hsl(var(--primary))', strokeWidth: isMobile ? 1.5 : 2, r: isMobile ? 4 : 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
