"use client"

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
import { FileDown, Receipt, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"
import { BillDialog } from "./BillDialog"
import { useGetBillQuery } from "@/features/payment/PaymentApiSlice"

interface PaymentListProps {
  payments: PaymentResponse[]
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function PaymentList({ payments, currentPage, totalPages, totalItems, onPageChange }: PaymentListProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponse | null>(null)
  const [isBillDialogOpen, setIsBillDialogOpen] = useState(false)

  // Fetch bill data when a payment is selected
  const { data: billData, isLoading: isBillLoading } = useGetBillQuery(
    selectedPayment?.paymentId || 0,
    { skip: !selectedPayment?.paymentId }
  )

  // Helper function to render payment status badge
  const renderStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    let displayStatus = status // Default to the original status

    // Map the status to Vietnamese display text
    switch (normalizedStatus) {
      case "pending":
      case "chờ xử lý":
        displayStatus = "Đang chờ thanh toán"
        break
      case "completed":
      case "success":
      case "thành công":
      case "paid": // Include "paid" here
        displayStatus = "Thanh toán thành công"
        break
      case "failed":
      case "cancelled":
        displayStatus = "Đã hủy"
        break
      case "thất bại":
        displayStatus = "Thất bại"
        break
      default:
        displayStatus = status // Fallback to the original status if not matched
    }

    // Render the badge based on the normalized status
    switch (normalizedStatus) {
      case "completed":
      case "success":
      case "thành công":
      case "paid": // Ensure "PAID" gets the green badge
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white font-medium px-3 py-1.5 transition-all">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
              {displayStatus}
            </span>
          </Badge>
        )
      case "pending":
      case "chờ xử lý":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 px-3 py-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              {displayStatus}
            </span>
          </Badge>
        )
      case "failed":
      case "cancelled":
        return (
          <Badge variant="destructive" className="px-3 py-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
              {displayStatus}
            </span>
          </Badge>
        )
      case "thất bại":
        return (
          <Badge variant="destructive" className="px-3 py-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
              {displayStatus}
            </span>
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="px-3 py-1.5 font-medium">
            {displayStatus}
          </Badge>
        )
    }
  }

  // Helper function to map payment method to Vietnamese
  const formatPaymentMethod = (method: string) => {
    switch (method.toUpperCase()) {
      case "CASH":
        return "Tiền mặt"
      case "TRANSFER":
        return "Chuyển khoản"
      default:
        return method // Fallback to the original method if not CASH or TRANSFER
    }
  }

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

  // Generate pagination links
  const renderPaginationLinks = () => {
    const items = []
    const maxVisiblePages = 3 // Số trang hiển thị tối đa

    // Xác định phạm vi trang hiển thị
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Điều chỉnh startPage nếu endPage đã đến giới hạn
    startPage = Math.max(1, endPage - maxVisiblePages + 1)

    // Nút Previous
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => onPageChange(currentPage - 1)}
          className={`hover:bg-muted/50 transition-colors cursor-pointer ${currentPage <= 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          tabIndex={currentPage <= 1 ? -1 : 0}
          aria-disabled={currentPage <= 1}
        />
      </PaginationItem>,
    )

    // Hiển thị trang đầu tiên và ellipsis nếu cần
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink
            onClick={() => onPageChange(1)}
            className="hover:bg-muted/50 transition-colors cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>,
      )

      if (startPage > 2) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }
    }

    // Trang giữa
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink
            isActive={page === currentPage}
            onClick={() => onPageChange(page)}
            className={
              page === currentPage
                ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm"
                : "hover:bg-muted/50 transition-colors cursor-pointer"
            }
          >
            {page}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Hiển thị trang cuối cùng và ellipsis nếu cần
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => onPageChange(totalPages)}
            className="hover:bg-muted/50 transition-colors cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Nút Next
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => onPageChange(currentPage + 1)}
          className={`hover:bg-muted/50 transition-colors cursor-pointer ${currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
          tabIndex={currentPage >= totalPages ? -1 : 0}
          aria-disabled={currentPage >= totalPages}
        />
      </PaginationItem>,
    )

    return items
  }

  const handleViewBill = (payment: PaymentResponse) => {
    setSelectedPayment(payment)
    setIsBillDialogOpen(true)
  }

  // Transform API data to match BillDialog props
  const transformBillData = () => {
    if (!billData?.data) return null;

    const voucherValue = Number(billData.data.voucherValue) || 0;

    return {
      orderInfo: {
        orderId: billData.data.orderId?.toString() || "",
        tableId: `BÀN - ${billData.data.tableNumber || ""}`,
        checkInTime: new Date(billData.data.timeIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        checkOutTime: new Date(billData.data.timeOut).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        date: new Date(billData.data.date).toLocaleDateString('vi-VN')
      },
      items: billData.data.orderItems.map(item => ({
        id: item.id,
        name: item.dishName,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      payment: {
        subTotal: billData.data.totalAmount + voucherValue,
        tax: 0,
        total: billData.data.totalAmount,
        receivedAmount: billData.data.receivedAmount,
        change: billData.data.change,
        voucherDiscount: voucherValue
      }
    }
  }

  if (payments.length === 0) {
    return (
      <Card className="w-full border-dashed animate-in fade-in duration-300">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-muted/30 p-6 mb-6 ring-8 ring-muted/10">
            <Receipt className="h-12 w-12 text-muted-foreground opacity-80" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">Không có hóa đơn</h3>
          <p className="text-muted-foreground mb-8 max-w-md text-base">
            Chưa có hóa đơn thanh toán nào được tạo hoặc không tìm thấy hóa đơn phù hợp với tìm kiếm của bạn.
          </p>
          <Button className="gap-2 px-5 py-2.5 h-auto font-medium text-base">
            <FileDown className="h-5 w-5" />
            Tạo hóa đơn mới
          </Button>
        </CardContent>
      </Card>
    )
  }

  const transformedBillData = transformBillData()

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <TooltipProvider>
        <Card className="overflow-hidden border shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold text-sm w-[80px] text-center">ID Hóa đơn</TableHead>
                  <TableHead className="font-semibold text-sm w-[120px] text-right">Tổng tiền</TableHead>
                  <TableHead className="font-semibold text-sm w-[120px] text-right">Số tiền thực nhận</TableHead>
                  <TableHead className="font-semibold text-sm w-[100px] text-center">Phương thức</TableHead>
                  <TableHead className="font-semibold text-sm w-[200px] text-center">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-sm w-[150px] text-center">Ngày thanh toán</TableHead>
                  <TableHead className="font-semibold text-sm w-[100px] text-center">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow
                    key={payment.paymentId}
                    className="group hover:bg-muted/30 transition-colors border-b border-muted/60"
                  >
                    <TableCell className="text-muted-foreground font-medium text-center py-3.5">
                      <span className="bg-muted/40 px-2.5 py-1.5 rounded-md text-xs font-semibold">
                        #{payment.orderId}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold py-3.5">
                      {formatCurrency(payment.amountPaid)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-muted-foreground py-3.5">
                      {payment.receivedAmount ? formatCurrency(payment.receivedAmount) : "—"}
                    </TableCell>
                    <TableCell className="text-center py-3.5">
                      <Badge
                        variant="outline"
                        className={`font-normal ${
                          payment.paymentMethod.toUpperCase() === "CASH"
                            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                        } transition-colors`}
                      >
                        {formatPaymentMethod(payment.paymentMethod)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-3.5">{renderStatusBadge(payment.paymentStatus)}</TableCell>
                    <TableCell className="text-muted-foreground text-center py-3.5">
                      <div className="flex flex-col items-center">
                        <span className="text-foreground font-medium">
                          {formatDate(payment.paymentDate).split(",")[0]}
                        </span>
                        <span className="text-xs opacity-80">{formatDate(payment.paymentDate).split(",")[1]}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-3.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleViewBill(payment)}
                        disabled={isBillLoading}
                      >
                        {isBillLoading && selectedPayment?.paymentId === payment.paymentId ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">Xem hóa đơn</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </TooltipProvider>

      <div className="flex items-center justify-between pt-2">
        <Pagination>
          <PaginationContent>{renderPaginationLinks()}</PaginationContent>
        </Pagination>
      </div>

      {/* Bill Dialog */}
      {selectedPayment && transformedBillData && (
        <BillDialog
          isOpen={isBillDialogOpen}
          onClose={() => {
            setIsBillDialogOpen(false)
            setSelectedPayment(null)
          }}
          billData={transformedBillData}
          paymentId={selectedPayment.paymentId}
        />
      )}
    </div>
  )
}

