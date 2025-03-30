"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ActivityLog } from "@/features/activitylog/types"

interface ActivityStatsProps {
  data: ActivityLog[]
}

export function ActivityStats({ data }: ActivityStatsProps) {
  // Tính toán thống kê theo hành động
  const actionCounts = data.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalActions = data.length
  const actionStats = Object.entries(actionCounts).map(([action, count]) => ({
    action,
    count,
    percentage: Math.round((count / totalActions) * 100)
  })).sort((a, b) => b.count - a.count)

  // Tính toán thống kê theo đối tượng
  const targetCounts = data.reduce((acc, log) => {
    acc[log.target] = (acc[log.target] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const targetStats = Object.entries(targetCounts)
    .map(([target, count]) => ({
      target,
      count,
      percentage: Math.round((count / totalActions) * 100)
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-sm font-medium">Theo loại hành động</h4>
        <div className="space-y-2">
          {actionStats.map((stat) => (
            <div key={stat.action} className="flex items-center">
              <div className="w-16 text-sm">{stat.action}</div>
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${stat.percentage}%` }} />
                </div>
              </div>
              <div className="w-12 text-right text-sm">{stat.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium">Theo đối tượng</h4>
        <div className="grid grid-cols-2 gap-2">
          {targetStats.map((stat) => (
            <Card key={stat.target} className="overflow-hidden">
              <CardContent className="p-2">
                <div className="text-xs font-medium">{stat.target}</div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-bold">{stat.count}</span>
                  <span className="text-xs text-muted-foreground">{stat.percentage}%</span>
                </div>
                <div className="mt-1 h-1 w-full rounded-full bg-secondary">
                  <div className="h-1 rounded-full bg-primary" style={{ width: `${stat.percentage}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 