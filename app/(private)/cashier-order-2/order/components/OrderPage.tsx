"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useGetOrdersByReservationIdQuery } from "@/features/order/orderApiSlice"
import type { ReservationResponse, TableInfo } from "@/features/reservation/type"
import { Clock, Users, Phone, User, ShoppingBag, Eye } from "lucide-react"
import OrderBadge from "./OrderBadge"

interface OrderPageProps {
  reservations: ReservationResponse[]
}

interface OrderQueryResult {
  data: any
  isLoading: boolean
  error: any
  reservationId: number
}

export default function OrderPage({ reservations }: OrderPageProps) {
  const router = useRouter()

  // Filter active reservations
  const activeReservations = useMemo(
    () =>
      reservations.filter(
        (reservation) => reservation.detail.status !== "CANCELLED" && reservation.detail.status !== "COMPLETED",
      ),
    [reservations],
  )

  // Create an array of reservation IDs
  const reservationIds = useMemo(() => activeReservations.map((reservation) => reservation.id), [activeReservations])

  console.log('Active Reservations:', activeReservations)
  console.log('Reservation IDs:', reservationIds)

  // Create individual queries for each reservation
  const queries = reservationIds.map(id => 
    useGetOrdersByReservationIdQuery(id, {
      skip: !id,
      refetchOnMountOrArgChange: true,
    })
  )

  // Create a map of reservation IDs to their orders
  const ordersMap = useMemo(() => {
    console.log('Building orders map from queries')
    const map = new Map<number, any[]>()
    queries.forEach((query, index) => {
      const reservationId = reservationIds[index]
      console.log('Query result for reservation', reservationId, ':', query)
      // Always set an entry in the map, even if no data or error
      if (query.data?.data) {
        map.set(reservationId, query.data.data) // Set orders if data exists
      } else {
        map.set(reservationId, []) // Set empty array for no data or error
      }
    })
    console.log('Final orders map:', Array.from(map.entries()))
    return map
  }, [queries, reservationIds])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200">Đang chờ</Badge>
        )
      case "CONFIRMED":
        return <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-200 border border-sky-200">Đã xác nhận</Badge>
      case "COMPLETED":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200">
            Hoàn thành
          </Badge>
        )
      default:
        return <Badge className="bg-slate-100 text-slate-800 border border-slate-200">{status}</Badge>
    }
  }

  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return "N/A"
    return format(new Date(dateTimeStr), "HH:mm - dd/MM/yyyy", { locale: vi })
  }

  const getCardColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white"
      case "CONFIRMED":
        return "border-l-4 border-l-sky-500 bg-gradient-to-br from-sky-50 to-white"
      case "COMPLETED":
        return "border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-white"
      default:
        return "border-l-4 border-l-slate-400 bg-gradient-to-br from-slate-50 to-white"
    }
  }

  const getTableNumbers = (tables: TableInfo[] | undefined) => {
    if (!tables || tables.length === 0) return "N/A"
    return tables.map((table) => table.tableNumber).join(", ")
  }

  const handleCreateOrder = (reservation: ReservationResponse, hasOrders: boolean) => {
    if (hasOrders) {
      toast.success(`Đang xem đơn hàng cho đặt bàn ${reservation.id}.`, {
        position: "top-right",
      })
      router.push(`./order/${reservation.id}`) // Navigate to view orders
    } else {
      toast.success(`Đang tạo đơn hàng cho đặt bàn ${reservation.id}.`, {
        position: "top-right",
      })
      router.push(`./order/menu-order/${reservation.id}`) // Navigate to create order
    }
  }

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] bg-white rounded-lg p-8">
        <ShoppingBag className="h-16 w-16 text-slate-300 mb-4" />
        <p className="text-slate-600 text-lg font-medium text-center">Không có dữ liệu đặt bàn hiện tại</p>
        <p className="text-slate-500 text-sm mt-2 text-center">Các đặt bàn mới sẽ xuất hiện ở đây khi có khách đặt</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {activeReservations.map((reservation) => {
        const orders = ordersMap.get(reservation.id) || []
        const hasOrders = orders.length > 0

        return (
          <Card
            key={reservation.id}
            className={`${getCardColor(
              reservation.detail.status,
            )} shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden`}
          >
            <CardHeader className="pb-2 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-sm">
                    Bàn {getTableNumbers(reservation.detail.tables)}
                  </span>
                </CardTitle>
                <div className="flex items-center space-x-2">{getStatusBadge(reservation.detail.status)}</div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Khách hàng</p>
                    <p className="text-slate-800 font-medium">
                      {!reservation.detail.customerName || reservation.detail.customerName === "stringstri"
                        ? "Chưa có tên"
                        : reservation.detail.customerName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Số điện thoại</p>
                    <p className="text-slate-800 font-medium">
                      {!reservation.detail.customerPhone || reservation.detail.customerPhone === "stringstri"
                        ? "Chưa có SĐT"
                        : reservation.detail.customerPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Số người</p>
                    <p className="text-slate-800 font-medium">{reservation.detail.numberOfPeople}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Thời gian vào</p>
                    <p className="text-slate-800 font-medium">{formatDateTime(reservation.timeIn)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center mt-2">
                {hasOrders ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 py-1.5">
                    <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                    Có {orders.length} đơn hàng
                  </Badge>
                ) : (
                  <Badge className="bg-rose-100 text-rose-800 border border-rose-200 py-1.5">
                    <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                    Chưa có đơn hàng
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="default"
                size="sm"
                className={`w-full ${
                  hasOrders ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                } text-white flex items-center justify-center gap-2`}
                onClick={() => handleCreateOrder(reservation, hasOrders)}
              >
                {hasOrders ? (
                  <>
                    <Eye className="h-4 w-4" />
                    Xem đơn hàng
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Tạo đơn hàng
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}