"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useMergeOrdersMutation, useGetOrdersByReservationIdQuery } from "@/features/order/orderApiSlice"
import type { Order } from "@/features/order/types"
import { toast } from "sonner"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, MergeIcon, AlertCircle } from "lucide-react"

interface MergeOrdersDialogProps {
  isOpen: boolean
  onClose: () => void
  reservationId: number
}

export function MergeOrdersDialog({ isOpen, onClose, reservationId }: MergeOrdersDialogProps) {
  const { data: ordersResponse, isLoading } = useGetOrdersByReservationIdQuery(reservationId)
  const [mergeOrdersMutation, { isLoading: isMerging }] = useMergeOrdersMutation()
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([])
  const [isAllSelected, setIsAllSelected] = useState(false)

  const orders = ordersResponse?.data || []

  // Reset selections when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedOrderIds([])
      setIsAllSelected(false)
    }
  }, [isOpen])

  // Update isAllSelected state when selectedOrderIds change
  useEffect(() => {
    if (orders.length > 0 && selectedOrderIds.length === orders.length) {
      setIsAllSelected(true)
    } else {
      setIsAllSelected(false)
    }
  }, [selectedOrderIds, orders])

  const handleCheckboxChange = (orderId: number, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds((prev) => [...prev, orderId])
    } else {
      setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all orders
      setSelectedOrderIds(orders.map((order) => order.id))
    } else {
      // Deselect all orders
      setSelectedOrderIds([])
    }
    setIsAllSelected(checked)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Đang chờ":
      case "Đang chuẩn bị":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            {status}
          </Badge>
        )
      case "Đã phục vụ":
      case "Đã hoàn thành":
        return (
          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300">
            {status}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            {status}
          </Badge>
        )
    }
  }

  const formatTime = (dateTime: string) => {
    return format(new Date(dateTime), "HH:mm")
  }

  const calculateTotalPrice = (order: Order) => {
    return order.orderItems.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)
  }

  const calculateTotalSelectedPrice = () => {
    return orders
      .filter((order) => selectedOrderIds.includes(order.id))
      .reduce((sum, order) => sum + calculateTotalPrice(order), 0)
  }

  const handleMergeOrders = async () => {
    if (selectedOrderIds.length < 2) {
      toast.error("Vui lòng chọn ít nhất hai đơn hàng để gộp")
      return
    }

    try {
      await mergeOrdersMutation({
        orderIds: selectedOrderIds,
        reservationId: reservationId,
      }).unwrap()

      toast.success("Gộp đơn hàng thành công")
      onClose()
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Có lỗi xảy ra khi gộp đơn hàng"
      toast.error(errorMessage)
      console.error("Merge orders error:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MergeIcon className="h-5 w-5 text-blue-500" />
            Gộp Đơn Hàng
          </DialogTitle>
          <DialogDescription>Chọn các đơn hàng để gộp thành một đơn hàng duy nhất</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <Checkbox
                id="select-all"
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                className={isAllSelected ? "border-blue-500 data-[state=checked]:bg-blue-500" : ""}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Chọn tất cả ({orders.length} đơn hàng)
              </label>
            </div>

            <div className="grid grid-cols-4 gap-2 font-medium text-sm py-2 px-1 bg-gray-50 rounded-md">
              <div className="col-span-1">Chọn</div>
              <div className="col-span-1">Đơn hàng</div>
              <div className="col-span-1">Trạng thái</div>
              <div className="col-span-1 text-right">Tổng tiền</div>
            </div>

            <ScrollArea className="max-h-[300px] pr-4">
              <div className="space-y-3 py-2">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`grid grid-cols-4 items-center gap-2 py-3 border-b border-gray-100 ${
                      selectedOrderIds.includes(order.id) ? "bg-blue-50 -mx-2 px-2 rounded-md" : ""
                    }`}
                  >
                    <div className="col-span-1">
                      <Checkbox
                        id={`order-${order.id}`}
                        checked={selectedOrderIds.includes(order.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(order.id, checked as boolean)}
                        className={
                          selectedOrderIds.includes(order.id) ? "border-blue-500 data-[state=checked]:bg-blue-500" : ""
                        }
                      />
                    </div>
                    <div className="col-span-1 text-sm">
                      <div className="font-medium">Đơn #{order.id}</div>
                      <div className="text-xs text-gray-500">{formatTime(order.createdAt)}</div>
                    </div>
                    <div className="col-span-1">{getStatusBadge(order.statusLabel)}</div>
                    <div className="col-span-1 text-sm font-medium text-right">
                      {calculateTotalPrice(order).toLocaleString("vi-VN")} đ
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                <span className="text-sm font-medium">Tổng tiền sau khi gộp:</span>
                <span className="text-lg font-semibold text-blue-700">
                  {calculateTotalSelectedPrice().toLocaleString("vi-VN")} đ
                </span>
              </div>

              {selectedOrderIds.length < 2 && (
                <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 p-2 rounded border border-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <span>Vui lòng chọn ít nhất hai đơn hàng để gộp</span>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-end gap-2 sm:gap-0 mt-4">
              <DialogClose asChild>
                <Button variant="outline">Hủy</Button>
              </DialogClose>
              <Button
                onClick={handleMergeOrders}
                disabled={selectedOrderIds.length < 2 || isMerging}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isMerging ? "Đang xử lý..." : "Gộp đơn hàng"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

