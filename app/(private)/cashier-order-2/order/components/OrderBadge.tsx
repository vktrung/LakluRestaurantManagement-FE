import React, { useEffect } from 'react'
import { useGetOrdersByReservationIdQuery } from '@/features/order/orderApiSlice'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, RefreshCw, AlertTriangle } from 'lucide-react'

interface OrderBadgeProps {
  reservationId: string
  onOrdersLoaded?: (reservationId: string, orders: any[]) => void
}
export default function OrderBadge({ reservationId, onOrdersLoaded }: OrderBadgeProps) {
  const { data: ordersData, isLoading, isError } = useGetOrdersByReservationIdQuery(Number(reservationId), {
    skip: !reservationId,
    refetchOnMountOrArgChange: true,
  })

  useEffect(() => {
    if (ordersData?.data) {
      onOrdersLoaded?.(reservationId, ordersData.data)
    }
  }, [ordersData, reservationId, onOrdersLoaded])

  if (isLoading) {
    return (
      <Badge className="bg-slate-100 text-slate-800 border border-slate-200 py-1.5">
        <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
        Đang tải...
      </Badge>
    )
  }

  if (isError) {
    return (
      <Badge className="bg-rose-100 text-rose-800 border border-rose-200 py-1.5">
        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
        Lỗi tải đơn
      </Badge>
    )
  }

  const orders = ordersData?.data || []
  const hasOrders = orders.length > 0

  return (
    <Badge
      className={`${
        hasOrders
          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
          : "bg-rose-100 text-rose-800 border border-rose-200"
      } py-1.5`}
    >
      <ShoppingBag className="h-3.5 w-3.5 mr-1" />
      {hasOrders ? `Có ${orders.length} đơn hàng` : "Chưa có đơn hàng"}
    </Badge>
  )
} 