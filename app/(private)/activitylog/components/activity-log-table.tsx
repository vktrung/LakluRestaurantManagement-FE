"use client"

import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ActivityLog } from "@/features/activitylog/types"
import { vi } from "date-fns/locale"

interface ActivityLogTableProps {
  data: ActivityLog[]
  onSort?: (field: keyof ActivityLog) => void
  sortField?: keyof ActivityLog
  sortOrder?: 'asc' | 'desc'
}

export function ActivityLogTable({ data, onSort, sortField, sortOrder }: ActivityLogTableProps) {
  const getSortIcon = (field: keyof ActivityLog) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
    return <ArrowUpDown className={`ml-2 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
  }

  const getActionText = (action: string) => {
    switch (action) {
      case "CREATE":
        return "Tạo mới"
      case "UPDATE":
        return "Cập nhật"
      case "DELETE":
        return "Xóa"
      case "CANCEL":
        return "Hủy"
      case "PROCESS":
        return "Xử lý"
      case "REFUND":
        return "Hoàn tiền"
      default:
        return action
    }
  }

  const getActionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (action) {
      case "CREATE":
        return "default"
      case "UPDATE":
        return "secondary"
      case "DELETE":
        return "destructive"
      case "CANCEL":
      case "REFUND":
        return "outline"
      default:
        return "default"
    }
  }

  const getActionColor = (action: string): string => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "UPDATE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "CANCEL":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "PROCESS":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "REFUND":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[120px]">
              <Button variant="ghost" onClick={() => onSort?.('action')} className="w-full justify-start font-medium hover:bg-transparent">
                Hành động {getSortIcon('action')}
              </Button>
            </TableHead>
            <TableHead className="w-[180px]">
              <Button variant="ghost" onClick={() => onSort?.('target')} className="w-full justify-start font-medium hover:bg-transparent">
                Đối tượng {getSortIcon('target')}
              </Button>
            </TableHead>
            <TableHead className="w-[300px]">
              <div className="pl-4 font-medium">Chi tiết</div>
            </TableHead>
            <TableHead className="w-[150px]">
              <Button variant="ghost" onClick={() => onSort?.('userInfo')} className="w-full justify-start font-medium hover:bg-transparent">
                Người dùng {getSortIcon('userInfo')}
              </Button>
            </TableHead>
            <TableHead className="w-[150px]">
              <Button variant="ghost" onClick={() => onSort?.('createdAt')} className="w-full justify-start font-medium hover:bg-transparent">
                Thời gian {getSortIcon('createdAt')}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((log) => (
            <TableRow key={log.id} className="hover:bg-muted/50">
              <TableCell className="w-[120px]">
                <div className={`inline-flex min-w-[90px] items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getActionColor(log.action)}`}>
                  {getActionText(log.action)}
                </div>
              </TableCell>
              <TableCell className="w-[180px] font-medium">{log.target}</TableCell>
              <TableCell className="w-[300px] truncate pl-4 text-muted-foreground">{log.details}</TableCell>
              <TableCell className="w-[150px] font-medium">{log.userInfo.username}</TableCell>
              <TableCell className="w-[150px] text-muted-foreground">
                {format(new Date(log.createdAt), "HH:mm dd/MM/yyyy", { locale: vi })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 