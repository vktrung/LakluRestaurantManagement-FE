import type { OrderItem } from "@/features/payment/types"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface OrderSummaryProps {
  total: string
  vat: string
  orderItems: OrderItem[]
  voucherValue?: string | number | null
}

export function OrderSummary({ total, vat, orderItems, voucherValue }: OrderSummaryProps) {
  // Tính tổng trước VAT từ orderItems
  const subTotal = orderItems.reduce((sum, item) => {
    const price = Number(item.price) || 0
    const quantity = item.quantity || 0
    return sum + price * quantity
  }, 0)

  // Định dạng giá trị voucher
  const formattedVoucherValue = voucherValue 
    ? Number(voucherValue).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    : null

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Chi tiết đơn hàng</h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Tổng trước VAT:</span>
            <span className="font-medium">
              {subTotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
            </span>
          </div>

          {Number(vat) >= 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">VAT:</span>
              <span className="font-medium">{Number(vat)}%</span>
            </div>
          )}
          
          {/* Hiển thị giá trị voucher nếu có */}
          {formattedVoucherValue && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Giảm giá voucher:</span>
              <span className="font-medium text-green-600">-{formattedVoucherValue}</span>
            </div>
          )}

          <Separator className="my-2" />

          <div className="flex justify-between items-center">
            <span className="font-semibold">Tổng cộng:</span>
            <span className="text-lg font-bold text-primary">{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

