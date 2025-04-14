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
import { useSplitOrderMutation } from "@/features/order/orderApiSlice"
import type { Order, OrderItemSplitRequest } from "@/features/order/types"
import { toast } from "sonner"
import { Minus, Plus, SquareSplitVerticalIcon as SplitSquare, AlertCircle, ArrowRight } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SplitOrderDialogProps {
  isOpen: boolean
  onClose: () => void
  order: Order
}

export function SplitOrderDialog({ isOpen, onClose, order }: SplitOrderDialogProps) {
  const [splitOrderMutation, { isLoading }] = useSplitOrderMutation()
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  // Initialize quantities when the component mounts or order changes
  useEffect(() => {
    const initialQuantities: Record<number, number> = {}
    order?.orderItems.forEach((item) => {
      initialQuantities[item.orderItemId] = 1
    })
    setQuantities(initialQuantities)
    setSelectedItems([])
  }, [order])

  const handleCheckboxChange = (orderItemId: number, checked: boolean) => {
    // Kiểm tra nếu đang chọn tất cả các món
    if (checked && selectedItems.length === order.orderItems.length - 1) {
      toast.warning("Không thể tách tất cả các món. Phải để lại ít nhất một món trong đơn hàng gốc.");
      return;
    }

    if (checked) {
      setSelectedItems((prev) => [...prev, orderItemId])
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== orderItemId))
    }
  }

  const handleQuantityChange = (orderItemId: number, action: "increment" | "decrement") => {
    const item = order.orderItems.find((item) => item.orderItemId === orderItemId)
    if (!item) return

    setQuantities((prev) => {
      const currentQuantity = prev[orderItemId] || 1
      const maxQuantity = item.quantity

      if (action === "increment" && currentQuantity < maxQuantity) {
        return { ...prev, [orderItemId]: currentQuantity + 1 }
      }
      if (action === "decrement" && currentQuantity > 1) {
        return { ...prev, [orderItemId]: currentQuantity - 1 }
      }
      return prev
    })
  }

  const calculateTotalPrice = () => {
    let total = 0
    selectedItems.forEach((itemId) => {
      const item = order.orderItems.find((item) => item.orderItemId === itemId)
      if (item) {
        total += item.dish.price * (quantities[itemId] || 1)
      }
    })
    return total
  }

  const handleSplitOrder = async () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một món để tách đơn hàng")
      return
    }

    try {
      // Create the order items array for the request
      const orderItems: OrderItemSplitRequest[] = selectedItems.map((itemId) => ({
        orderItemId: itemId,
        quantity: quantities[itemId] || 1,
      }))

      await splitOrderMutation({
        orderId: order.id,
        orderItems: orderItems,
      }).unwrap()

      toast.success("Tách đơn hàng thành công")
      onClose()
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Có lỗi xảy ra khi tách đơn hàng"
      toast.error(errorMessage)
      console.error("Split order error:", error)
    }
  }

  const originalTotal = order?.orderItems.reduce((sum, item) => sum + item.dish.price * item.quantity, 0) || 0

  const newTotal = calculateTotalPrice()
  const remainingTotal = originalTotal - newTotal

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <SplitSquare className="h-5 w-5 text-orange-500" />
            Tách Đơn Hàng #{order?.id}
          </DialogTitle>
          <DialogDescription>Chọn các món ăn và số lượng để tách thành đơn hàng mới</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-2 font-medium text-sm py-2 px-1 bg-gray-50 rounded-md">
          <div className="col-span-1">Chọn</div>
          <div className="col-span-1">Món ăn</div>
          <div className="col-span-1">Số lượng</div>
          <div className="col-span-1 text-right">Giá</div>
        </div>

        <ScrollArea className="max-h-[300px] pr-4">
          <div className="space-y-3">
            {order?.orderItems.map((item) => (
              <div
                key={item.orderItemId}
                className={`grid grid-cols-4 items-center gap-2 py-3 border-b border-gray-100 ${
                  selectedItems.includes(item.orderItemId) ? "bg-orange-50 -mx-2 px-2 rounded-md" : ""
                }`}
              >
                <div className="col-span-1 flex items-center">
                  <Checkbox
                    id={`item-${item.orderItemId}`}
                    checked={selectedItems.includes(item.orderItemId)}
                    onCheckedChange={(checked) => handleCheckboxChange(item.orderItemId, checked as boolean)}
                    className={
                      selectedItems.includes(item.orderItemId)
                        ? "border-orange-500 data-[state=checked]:bg-orange-500"
                        : ""
                    }
                  />
                </div>
                <div className="col-span-1 text-sm font-medium line-clamp-2">{item.dish.name}</div>
                <div className="col-span-1 flex items-center space-x-1">
                  <button
                    type="button"
                    disabled={!selectedItems.includes(item.orderItemId) || quantities[item.orderItemId] <= 1}
                    className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50 hover:bg-gray-200 transition-colors"
                    onClick={() => handleQuantityChange(item.orderItemId, "decrement")}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{quantities[item.orderItemId] || 1}</span>
                  <button
                    type="button"
                    disabled={
                      !selectedItems.includes(item.orderItemId) || quantities[item.orderItemId] >= item.quantity
                    }
                    className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50 hover:bg-gray-200 transition-colors"
                    onClick={() => handleQuantityChange(item.orderItemId, "increment")}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <span className="text-xs text-gray-500 ml-1">/ {item.quantity}</span>
                </div>
                <div className="col-span-1 text-sm font-medium text-right">
                  {item.dish.price.toLocaleString("vi-VN")} đ
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 space-y-3 bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tổng tiền đơn hàng gốc:</span>
            <span className="font-medium">{originalTotal.toLocaleString("vi-VN")} đ</span>
          </div>

          <div className="flex items-center gap-2 py-2">
            <div className="flex-1 space-y-1">
              <div className="text-xs text-gray-500">Đơn hàng hiện tại</div>
              <div className="font-medium">{remainingTotal.toLocaleString("vi-VN")} đ</div>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex-1 space-y-1">
              <div className="text-xs text-gray-500">Đơn hàng mới</div>
              <div className="font-medium text-orange-600">{newTotal.toLocaleString("vi-VN")} đ</div>
            </div>
          </div>

          {selectedItems.length === 0 && (
            <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 p-2 rounded border border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <span>Vui lòng chọn ít nhất một món để tách đơn hàng</span>
            </div>
          )}

          {selectedItems.length === order.orderItems.length - 1 && (
            <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 p-2 rounded border border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <span>Bạn đã chọn gần hết các món. Phải để lại ít nhất một món trong đơn hàng gốc.</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <Button
            onClick={handleSplitOrder}
            disabled={selectedItems.length === 0 || isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? "Đang xử lý..." : "Tách đơn hàng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

