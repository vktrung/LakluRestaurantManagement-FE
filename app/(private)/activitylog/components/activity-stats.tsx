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
  const actionStats = Object.entries(actionCounts).map(([action, count]) => {
    // Chuyển đổi tên hành động sang tiếng Việt
    const actionInVietnamese = getActionText(action);
    return {
      action: actionInVietnamese,
      count,
      percentage: Math.round((count / totalActions) * 100)
    };
  }).sort((a, b) => b.count - a.count)

  // Hàm chuyển đổi tên hành động sang tiếng Việt
  function getActionText(action: string): string {
    switch (action) {
      case "CREATE":
        return "Tạo mới";
      case "UPDATE":
        return "Cập nhật";
      case "DELETE":
        return "Xóa";
      case "CANCEL":
        return "Hủy";
      case "PROCESS":
        return "Xử lý";
      case "REFUND":
        return "Hoàn tiền";
      default:
        return action;
    }
  }

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
    </div>
  )
} 