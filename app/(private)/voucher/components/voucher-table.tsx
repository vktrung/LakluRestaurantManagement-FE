"use client"

import { Edit, Trash2, Calendar, Tag, Percent, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Voucher } from "@/features/voucher/type"
import { formatDate } from "@/lib/utils"

interface VoucherTableProps {
  vouchers: Voucher[]
  isLoading: boolean
  onEdit: (voucher: Voucher) => void
  onDelete: (voucher: Voucher) => void
}

export function VoucherTable({ vouchers, isLoading, onEdit, onDelete }: VoucherTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã Voucher</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Giá trị</TableHead>
            <TableHead>Thời gian hiệu lực</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Đang tải...
              </TableCell>
            </TableRow>
          ) : vouchers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Không tìm thấy voucher nào.
              </TableCell>
            </TableRow>
          ) : (
            vouchers.map((voucher) => (
              <TableRow key={voucher.id}>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {voucher.code}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {voucher.discountType === "PERCENTAGE" ? (
                      <Percent className="h-4 w-4 text-blue-500" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-green-500" />
                    )}
                    {voucher.discountType === "PERCENTAGE" ? "Phần trăm" : "Số tiền cố định"}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {voucher.discountType === "PERCENTAGE" 
                    ? `${voucher.discountValue}%` 
                    : `${voucher.discountValue.toLocaleString()} đ`}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help underline decoration-dotted">
                            {formatDate(voucher.validFrom)} - {formatDate(voucher.validUntil)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Từ: {formatDate(voucher.validFrom)}</p>
                          <p>Đến: {formatDate(voucher.validUntil)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={voucher.status === "ACTIVE" ? "default" : "secondary"}>
                    {voucher.status === "ACTIVE" ? "Đang hoạt động" : "Không hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(voucher)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Sửa</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(voucher)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Xóa</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

