"use client"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGetOrdersByReservationIdQuery, useDeleteOrderMutation } from "@/features/order/orderApiSlice"
import type { Order, OrderItem } from "@/features/order/types"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { SplitOrderDialog } from "./split-order-dialog"
import { MergeOrdersDialog } from "./merge-orders-dialog"
import {
  ArrowLeft,
  AlertTriangle,
  Trash,
  Clock,
  User,
  Receipt,
  SplitSquareVertical,
  CreditCard,
  Utensils,
  RefreshCw,
  Merge,
  CalendarClock,
  Printer,
} from "lucide-react"
import { useDeleteOrderItemByIdMutation } from "@/features/order/orderApiSlice"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils"

// Thêm interface cho dữ liệu phiếu tạm tính
interface TempOrderItem {
  id: number
  dishName: string
  quantity: number
  price: string | number
}

interface TempBillData {
  orderItems: TempOrderItem[]
  subtotal: number
  tableNumber: number
  date: string
}

// Thêm hàm xử lý in phiếu tạm tính
const handlePrintTempBill = (tempBillData: TempBillData): void => {
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Phiếu tạm tính - Bàn ${tempBillData.tableNumber || "—"}</title>
      <style>
        @page {
          size: 72mm auto;
          margin: 0;
        }
        
        body {
          font-family: monospace;
          width: 72mm;
          max-width: 72mm;
          margin: 0 auto;
          padding: 0;
          background-color: white;
          color: black;
          font-size: 12px;
        }
        
        .print-bill {
          width: 72mm;
          max-width: 72mm;
          padding: 2mm;
          font-size: 12px;
          box-sizing: border-box;
          margin: 0 auto;
        }
        
        h1 { 
          font-size: 14px; 
          margin: 5px 0; 
          text-align: center;
          font-weight: bold;
        }
        
        h2 { 
          font-size: 13px; 
          margin: 4px 0; 
          text-align: center;
          font-weight: semibold;
        }
        
        p { 
          font-size: 11px; 
          margin: 2px 0; 
        }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        .grid {
          display: table;
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
        }
        
        .grid > div {
          display: table-row;
        }
        
        .grid > div > div {
          display: table-cell;
          padding: 1mm 0;
        }
        
        .font-mono {
          font-family: monospace;
          font-size: 11px;
          letter-spacing: -0.5px;
        }
        
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .wrap-text {
          white-space: normal !important;
          word-break: normal !important;
          overflow-wrap: break-word !important;
          hyphens: none !important;
          overflow: visible !important;
          text-overflow: initial !important;
          max-width: 100px !important;
          display: table-cell !important;
        }
        
        .border-t {
          border-top: 1px solid black;
          margin: 2mm 0;
          display: block;
          width: 100%;
        }
        
        .border-dashed {
          border-top: 1px dashed black;
          margin: 2mm 0;
          display: block;
          width: 100%;
        }
        
        .col-span-1 { width: 8%; }
        .col-span-3 { width: 24%; }
        .col-span-4 { width: 32%; }
        .col-span-5 { width: 40%; }
        
        .space-y-1 > * + * {
          margin-top: 0.25rem;
        }
        
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-3 { margin-top: 0.75rem; }
        .mt-4 { margin-top: 1rem; }
        .ml-2 { margin-left: 0.5rem; }
        
        .gap-1 { gap: 0.25rem; }
        
        .font-bold { font-weight: bold; }
        .font-semibold { font-weight: 600; }
        
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .text-md { font-size: 1rem; }
      </style>
    </head>
    <body>
      <div class="print-bill">
        <!-- Header -->
        <div class="text-center mb-3">
          <h1 class="text-md font-bold">LAKLU - BIA KHÔ MỰC</h1>
          <h2 class="text-sm font-semibold mt-2 mb-3">PHIẾU TẠM TÍNH</h2>
        </div>

        <!-- Order Info -->
        <div class="grid gap-1 mb-3">
          <div>
            <div style="width: 50%;">
              <p class="text-xs">HÓA ĐƠN: ${tempBillData.tableNumber || "—"}</p>
            </div>
            <div style="width: 50%; text-align: right;">
              <p class="text-xs">NGÀY: ${new Date(tempBillData.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <!-- Table Header -->
        <div class="grid mb-1">
          <div>
            <div class="col-span-1 text-xs font-semibold">TT</div>
            <div class="col-span-4 text-xs font-semibold">Tên món</div>
            <div class="col-span-1 text-xs font-semibold text-center">SL</div>
            <div class="col-span-3 text-xs font-semibold text-right">Đơn giá</div>
            <div class="col-span-3 text-xs font-semibold text-right">T.Tiền</div>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t mb-1"></div>

        <!-- Items -->
        ${tempBillData.orderItems.map((item: TempOrderItem, index: number) => `
        <div class="grid mb-1">
          <div>
            <div class="col-span-1 text-xs">${index + 1}</div>
            <div class="col-span-4 text-xs wrap-text" style="white-space: normal; word-break: normal; overflow-wrap: break-word;">${item.dishName}</div>
            <div class="col-span-1 text-xs text-center">${item.quantity}</div>
            <div class="col-span-3 text-xs text-right font-mono">${formatPrice(Number(item.price), { currency: false, minLength: 8 })}</div>
            <div class="col-span-3 text-xs text-right font-mono">${formatPrice(Number(item.price) * item.quantity, { currency: false, minLength: 8 })}</div>
          </div>
        </div>
        `).join('')}

        <!-- Divider -->
        <div class="border-t border-dashed mt-2 mb-2"></div>

        <!-- Payment Summary -->
        <div class="text-right space-y-1 mb-3">
          <p class="text-xs font-bold">Tổng tạm tính: <span class="font-mono ml-2">${formatPrice(tempBillData.subtotal)}</span></p>
        </div>

        <!-- Footer -->
        <div class="text-center mt-4">
          <p class="text-xs">Phiếu tạm tính - Chưa thanh toán</p>
          <p class="text-xs mt-2">Cảm ơn quý khách!</p>
        </div>
      </div>
      <script>
        // Auto print when loaded
        window.onload = function() {
          setTimeout(function() {
            window.print();
            // Optional: Close the window after printing
            // setTimeout(function() { window.close(); }, 500);
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  // Create a new window with only the bill content
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) {
    alert('Vui lòng cho phép cửa sổ pop-up để in phiếu tạm tính');
    return;
  }

  // Write to the new window and print
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
};

export default function ReservationOrdersPage() {
  const params = useParams()
  const router = useRouter()
  const reservationId = Number(params.id)
  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false)
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [isDeleteOrderDialogOpen, setIsDeleteOrderDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)

  // API mutation để xóa món ăn
  const [deleteOrderItem, { isLoading: isDeleting }] = useDeleteOrderItemByIdMutation()
  const [deleteOrder, { isLoading: isOrderDeleting }] = useDeleteOrderMutation()

  // State cho modal cảnh báo
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")

  // Sử dụng skip: false để luôn fetch dữ liệu, và refetchOnMountOrArgChange: true để fetch lại mỗi khi component được mount
  const {
    data: ordersResponse,
    isLoading,
    isError,
    refetch,
  } = useGetOrdersByReservationIdQuery(reservationId, {
    skip: false,
    refetchOnMountOrArgChange: true,
  })

  const orders = ordersResponse?.data || []

  // Thêm useEffect để fetch lại dữ liệu mỗi khi truy cập trang
  useEffect(() => {
    // Fetch lại dữ liệu khi component được mount
    refetch()

    // Thêm event listener cho focus để fetch lại dữ liệu khi tab được focus lại
    const handleFocus = () => {
      refetch()
    }

    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("focus", handleFocus)
    }
  }, [refetch, reservationId])
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Đang chờ":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200">Đang chờ</Badge>
        )
      case "Đã hoàn thành":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200">
            Đã hoàn thành
          </Badge>
        )
      case "Đã giao":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200">
            Đã giao
          </Badge>
        )
      case "Đã hủy":
        return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-200">Đã hủy</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800 border border-slate-200">{status}</Badge>
    }
  }

  const formatDateTime = (dateTimeStr: string) => {
    return format(new Date(dateTimeStr), "HH:mm - dd/MM/yyyy", { locale: vi })
  }

  const getCardColor = (status: string) => {
    switch (status) {
      case "Đang chờ":
        return "border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white"
      case "Đã hoàn thành":
        return "border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-white"
      case "Đã giao":
        return "border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-white"
      default:
        return "border-l-4 border-l-slate-400 bg-gradient-to-br from-slate-50 to-white"
    }
  }

  const handleSplitOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsSplitDialogOpen(true)
  }

  const handleMergeOrders = () => {
    setIsMergeDialogOpen(true)
  }

  const handlePayment = (order: Order) => {
    // Kiểm tra xem tất cả các món ăn trong đơn hàng đã được giao hay chưa
    const allItemsDelivered = order.orderItems?.every((item) => item.statusLabel === "Đã giao")

    if (!allItemsDelivered) {
      // Hiển thị modal cảnh báo thay vì alert
      setWarningMessage(
        "Một số món ăn chưa được giao. Vui lòng đảm bảo tất cả món ăn đã được giao trước khi thanh toán.",
      )
      setShowWarningModal(true)
      return
    }

    // Nếu tất cả món đã giao, chuyển đến trang thanh toán
    setIsPaymentLoading(true)
    router.push(`/payment/${order.id}`)
  }

  const handleBackToOrders = () => {
    router.push("/cashier-order-2/order")
  }

  // Xử lý mở dialog xóa món ăn
  const openDeleteDialog = (itemId: number) => {
    setSelectedItemId(itemId)
    setIsDeleteDialogOpen(true)
  }

  // Xử lý xóa món ăn
  const handleDeleteOrderItem = async () => {
    if (!selectedItemId) return

    try {
      await deleteOrderItem(selectedItemId).unwrap()
      toast.success("Xóa món thành công", {
        description: "Món ăn đã được xóa khỏi đơn hàng",
      })
      // Đóng dialog và fetch lại dữ liệu
      setIsDeleteDialogOpen(false)
      refetch()
    } catch (error: any) {
      // Kiểm tra nếu có message từ backend
      const errorMessage = error?.data?.message || "Không thể xóa món ăn. Vui lòng thử lại sau."
      toast.error("Không thể xóa món", {
        description: errorMessage,
      })
      setIsDeleteDialogOpen(false)
    }
  }

  // Xử lý mở dialog xóa order
  const openDeleteOrderDialog = (orderId: number) => {
    setSelectedOrderId(orderId)
    setIsDeleteOrderDialogOpen(true)
  }

  // Xử lý xóa order
  const handleDeleteOrder = async () => {
    if (!selectedOrderId) return

    try {
      await deleteOrder(selectedOrderId).unwrap()
      toast.success("Xóa đơn hàng thành công", {
        description: "Đơn hàng đã được xóa",
      })
      setIsDeleteOrderDialogOpen(false)

      // Chuyển về trang danh sách đặt bàn và đảm bảo dữ liệu được cập nhật
      router.push("/cashier-order-2/order")
      // Đợi một chút để đảm bảo navigation đã hoàn tất
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Không thể xóa đơn hàng. Vui lòng thử lại sau."
      toast.error("Không thể xóa đơn hàng", {
        description: errorMessage,
      })
      setIsDeleteOrderDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-3 p-8 bg-white rounded-xl shadow-lg">
          <RefreshCw className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-slate-700 font-medium text-lg">Đang tải đơn hàng...</p>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-slate-300 hover:bg-slate-100 mt-4"
            onClick={handleBackToOrders}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Button>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-3 p-8 bg-white rounded-xl shadow-lg border border-rose-200">
          <AlertTriangle className="h-10 w-10 text-rose-600" />
          <p className="text-rose-600 text-lg font-medium">Đơn hàng trống hoặc không tồn tại</p>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-slate-300 hover:bg-slate-100 mt-4"
            onClick={handleBackToOrders}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 sm:p-6">
      {/* Modal cảnh báo món ăn chưa giao */}
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Không thể thanh toán
            </DialogTitle>
            <DialogDescription className="text-slate-700">{warningMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              variant="default"
              onClick={() => setShowWarningModal(false)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa món ăn */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash className="h-5 w-5 text-rose-600" />
              <span>Xác nhận xóa món ăn</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa món ăn này khỏi đơn hàng không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrderItem}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa món"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog xác nhận xóa đơn hàng */}
      <AlertDialog open={isDeleteOrderDialogOpen} onOpenChange={setIsDeleteOrderDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash className="h-5 w-5 text-rose-600" />
              <span>Xác nhận xóa đơn hàng</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đơn hàng này không? Chỉ có thể xóa đơn hàng khi tất cả các món trong đơn đều ở
              trạng thái đang chờ hoặc đã hủy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={isOrderDeleting}
            >
              {isOrderDeleting ? "Đang xóa..." : "Xóa đơn hàng"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-slate-300 hover:bg-slate-100"
            onClick={handleBackToOrders}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách đặt bàn
          </Button>

        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Receipt className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Đơn hàng cho đặt bàn #{reservationId}
            </h1>
          </div>

          {/* Nút gộp đơn - Chỉ hiển thị khi có nhiều hơn 1 đơn và tất cả món trong các đơn đều đã giao */}
          {orders.length > 1 &&
            orders.every((order) => order.orderItems.every((item) => item.statusLabel === "Đã giao")) && (
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100"
                onClick={handleMergeOrders}
              >
                <Merge className="h-4 w-4" />
                Gộp đơn hàng
              </Button>
            )}
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] bg-white rounded-xl shadow-sm p-8">
            <Receipt className="h-16 w-16 text-slate-300 mb-4" />
            <p className="text-slate-600 text-lg font-medium text-center">Đơn hàng trống hoặc không tồn tại</p>
            <p className="text-slate-500 text-sm mt-2 text-center mb-6">
              Vui lòng kiểm tra lại thông tin đơn hàng
            </p>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-slate-300 hover:bg-slate-100"
              onClick={handleBackToOrders}
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách đơn hàng
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.map((order: Order) => (
              <Card
                key={order.id}
                className={`${getCardColor(order.statusLabel)} shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden`}
              >
                <CardHeader className="pb-2 border-b border-slate-100">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-slate-600" />
                      Đơn #{order.id}
                    </CardTitle>
                    {getStatusBadge(order.statusLabel)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Nhân viên</p>
                        <p className="text-slate-800 font-medium">ID {order.staffId}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Thời gian tạo</p>
                        <p className="text-slate-800 font-medium">{formatDateTime(order.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Cập nhật lúc</p>
                        <p className="text-slate-800 font-medium">{formatDateTime(order.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Utensils className="h-4 w-4 text-slate-500" />
                      <p className="text-slate-700 font-medium">Món ăn</p>
                    </div>
                    <ul className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {order.orderItems.map((item: OrderItem) => (
                        <li
                          key={item.orderItemId}
                          className="flex items-center justify-between text-sm p-2 rounded-md bg-slate-50 border border-slate-100"
                        >
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="text-slate-800 font-medium">
                              {item.dish.name} <span className="text-slate-500">(x{item.quantity})</span>
                            </span>
                            {getStatusBadge(item.statusLabel)}
                          </div>

                          {/* Nút xóa món ăn - Chỉ hiển thị cho món ở trạng thái đang chờ hoặc đã hủy */}
                          {(item.statusLabel === "Đang chờ" || item.statusLabel === "Đã hủy") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 ml-2"
                              onClick={() => openDeleteDialog(item.orderItemId)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                  {/* Nút tách đơn - Chỉ hiển thị khi tất cả món trong đơn đều đã giao */}
                  {order.orderItems.length > 1 && order.orderItems.every((item) => item.statusLabel === "Đã giao") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center justify-center gap-2"
                      onClick={() => handleSplitOrder(order)}
                    >
                      <SplitSquareVertical className="h-4 w-4" />
                      Tách đơn hàng
                    </Button>
                  )}

                  <Button
                    variant="default"
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                    onClick={() => handlePayment(order)}
                    disabled={isPaymentLoading}
                  >
                    {isPaymentLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Đang chuyển hướng...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Thanh toán
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-2"
                    onClick={() => handlePrintTempBill({
                      orderItems: order.orderItems.map((item) => ({
                        id: item.orderItemId,
                        dishName: item.dish.name,
                        quantity: item.quantity,
                        price: item.dish.price,
                      })),
                      subtotal: order.orderItems.reduce((total, item) => total + (item.dish.price * item.quantity), 0),
                      tableNumber: order.tableNumber || reservationId,
                      date: order.updatedAt,
                    })}
                    >
                    <Printer className="h-4 w-4" />
                    In phiếu tạm tính
                  </Button>

                  {/* Nút xóa đơn - Chỉ hiển thị khi tất cả món trong đơn đang ở trạng thái đang chờ hoặc đã hủy */}
                  {order.orderItems.every(
                    (item) => item.statusLabel === "Đang chờ" || item.statusLabel === "Đã hủy",
                  ) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center gap-2"
                        onClick={() => openDeleteOrderDialog(order.id)}
                      >
                        <Trash className="h-4 w-4" />
                        Xóa đơn hàng
                      </Button>
                    )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {selectedOrder && (
          <SplitOrderDialog
            isOpen={isSplitDialogOpen}
            onClose={() => setIsSplitDialogOpen(false)}
            order={selectedOrder}
          />
        )}

        <MergeOrdersDialog
          isOpen={isMergeDialogOpen}
          onClose={() => setIsMergeDialogOpen(false)}
          reservationId={reservationId}
        />
      </div>
    </div>
  )
}