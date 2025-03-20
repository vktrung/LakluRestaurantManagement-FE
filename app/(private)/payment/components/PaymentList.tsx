import type { PaymentResponse } from "@/features/payment/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { FileDown } from "lucide-react"

interface PaymentListProps {
  payments: PaymentResponse[]
}

export function PaymentList({ payments }: PaymentListProps) {
  // Helper function to render payment status badge
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
      case "thành công":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case "pending":
      case "chờ xử lý":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-400">
            {status}
          </Badge>
        )
      case "failed":
      case "thất bại":
        return <Badge variant="destructive">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <FileDown className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Không có hóa đơn</h3>
        <p className="text-muted-foreground mb-4">Chưa có hóa đơn thanh toán nào được tạo.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-medium">Payment ID</TableHead>
                <TableHead className="font-medium">Order ID</TableHead>
                <TableHead className="font-medium text-right">Tổng tiền</TableHead>
                <TableHead className="font-medium text-right">Số tiền nhận</TableHead>
                <TableHead className="font-medium">Phương thức</TableHead>
                <TableHead className="font-medium">Trạng thái</TableHead>
                <TableHead className="font-medium">Ngày thanh toán</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.paymentId} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{payment.paymentId}</TableCell>
                  <TableCell>{payment.orderId}</TableCell>
                  <TableCell className="text-right font-medium">
                    {Number(payment.amountPaid).toLocaleString("vi-VN")} VND
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.receivedAmount ? `${Number(payment.receivedAmount).toLocaleString("vi-VN")} VND` : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {payment.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell>{renderStatusBadge(payment.paymentStatus)}</TableCell>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString("vi-VN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

