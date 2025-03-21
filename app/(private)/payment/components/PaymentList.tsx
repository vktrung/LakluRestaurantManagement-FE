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
import { Button } from "@/components/ui/button"

interface PaymentListProps {
  payments: PaymentResponse[]
}

export function PaymentList({ payments }: PaymentListProps) {
  // Helper function to render payment status badge
  const renderStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    let displayStatus = status; // Default to the original status

    // Map the status to Vietnamese display text
    switch (normalizedStatus) {
      case "pending":
      case "chờ xử lý":
        displayStatus = "Đang chờ thanh toán";
        break;
      case "completed":
      case "success":
      case "thành công":
      case "paid": // Include "paid" here
        displayStatus = "Thanh toán thành công";
        break;
      case "failed":
      case "thất bại":
        displayStatus = "Thất bại";
        break;
      default:
        displayStatus = status; // Fallback to the original status if not matched
    }

    // Render the badge based on the normalized status
    switch (normalizedStatus) {
      case "completed":
      case "success":
      case "thành công":
      case "paid": // Ensure "PAID" gets the green badge
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white font-medium px-3 py-1 transition-all">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
              {displayStatus}
            </span>
          </Badge>
        )
      case "pending":
      case "chờ xử lý":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-400 bg-yellow-50 px-3 py-1 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
              {displayStatus}
            </span>
          </Badge>
        )
      case "failed":
      case "thất bại":
        return (
          <Badge variant="destructive" className="px-3 py-1 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
              {displayStatus}
            </span>
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="px-3 py-1 font-medium">
            {displayStatus}
          </Badge>
        )
    }
  }

  // Helper function to map payment method to Vietnamese
  const formatPaymentMethod = (method: string) => {
    switch (method.toUpperCase()) {
      case "CASH":
        return "Tiền mặt";
      case "TRANSFER":
        return "Chuyển khoản";
      default:
        return method; // Fallback to the original method if not CASH or TRANSFER
    }
  };

  // Format currency with proper spacing and symbol
  const formatCurrency = (amount: number | string) => {
    const numAmount = Number(amount)
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(numAmount)
  }

  // Format date with better readability
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/5 rounded-lg border border-dashed border-muted animate-in fade-in">
        <div className="rounded-full bg-muted/20 p-4 mb-4 ring-4 ring-muted/10">
          <FileDown className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Không có hóa đơn</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Chưa có hóa đơn thanh toán nào được tạo hoặc không tìm thấy hóa đơn phù hợp với tìm kiếm của bạn.
        </p>
        <Button variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" />
          Tạo hóa đơn mới
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="rounded-md border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-sm w-[80px] text-center">ID Hóa đơn</TableHead>
                <TableHead className="font-semibold text-sm w-[120px] text-right">Tổng tiền</TableHead>
                <TableHead className="font-semibold text-sm w-[120px] text-right">Số tiền nhận</TableHead>
                <TableHead className="font-semibold text-sm w-[100px] text-center">Phương thức</TableHead>
                <TableHead className="font-semibold text-sm w-[200px] text-center">Trạng thái</TableHead>
                <TableHead className="font-semibold text-sm w-[150px] text-center">Ngày thanh toán</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow
                  key={payment.paymentId}
                  className="group hover:bg-muted/30 transition-colors border-b border-muted/60"
                >
                  <TableCell className="text-muted-foreground font-medium text-center py-3">
                    {payment.orderId}
                  </TableCell>
                  <TableCell className="text-right font-semibold py-3">
                    {formatCurrency(payment.amountPaid)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-muted-foreground py-3">
                    {payment.receivedAmount ? formatCurrency(payment.receivedAmount) : "N/A"}
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <Badge variant="outline" className="font-normal bg-muted/30 hover:bg-muted/50 transition-colors">
                      {formatPaymentMethod(payment.paymentMethod)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center py-3">
                    {renderStatusBadge(payment.paymentStatus)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-center py-3">
                    <div className="flex flex-col items-center">
                      <span>{formatDate(payment.paymentDate).split(",")[0]}</span>
                      <span className="text-xs">{formatDate(payment.paymentDate).split(",")[1]}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Hiển thị <span className="font-medium">{payments.length}</span> hóa đơn
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" className="hover:bg-muted/50 transition-colors" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive className="bg-primary text-primary-foreground hover:bg-primary/90">
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" className="hover:bg-muted/50 transition-colors">
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" className="hover:bg-muted/50 transition-colors">
                3
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" className="hover:bg-muted/50 transition-colors" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}