"use client"

import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
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
      case "Tạo mới":
        return "Tạo mới"
      case "UPDATE":
      case "Cập nhật":
        return "Cập nhật"
      case "DELETE":
      case "Xóa":
        return "Xóa"
      case "CANCEL":
      case "Hủy":
        return "Hủy"
      case "PROCESS":
      case "Xử lý":
        return "Xử lý"
      case "REFUND":
      case "Hoàn tiền":
        return "Hoàn tiền"
      default:
        return action
    }
  }

  const getActionColor = (action: string): string => {
    const actionText = getActionText(action);
    switch (actionText) {
      case "Tạo mới":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Cập nhật":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Xóa":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Hủy":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "Xử lý":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Hoàn tiền":
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
            <TableHead className="w-[150px]">
              <Button variant="ghost" onClick={() => onSort?.('createdAt')} className="w-full justify-start font-medium hover:bg-transparent">
                Thời gian {getSortIcon('createdAt')}
              </Button>
            </TableHead>
            <TableHead className="w-[150px]">
              <Button variant="ghost" onClick={() => onSort?.('userInfo')} className="w-full justify-start font-medium hover:bg-transparent">
                Người dùng {getSortIcon('userInfo')}
              </Button>
            </TableHead>
            <TableHead className="w-[120px]">
              <Button variant="ghost" onClick={() => onSort?.('action')} className="w-full justify-start font-medium hover:bg-transparent">
                Hành động {getSortIcon('action')}
              </Button>
            </TableHead>
            <TableHead>
              <div className="pl-4 font-medium">Chi tiết</div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((log) => (
            <TableRow key={log.id} className="hover:bg-muted/50">
              <TableCell className="w-[150px] text-muted-foreground">
                {format(new Date(log.createdAt), "HH:mm dd/MM/yyyy", { locale: vi })}
              </TableCell>
              <TableCell className="w-[150px] font-medium">{log.userInfo.username}</TableCell>
              <TableCell className="w-[120px]">
                <div className={`inline-flex min-w-[90px] items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getActionColor(log.action)}`}>
                  {getActionText(log.action)}
                </div>
              </TableCell>
              <TableCell className="truncate pl-4 text-muted-foreground">
                {log.details}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 