"use client"
import { useGetReservationsQuery } from "@/features/reservation/reservationApiSlice"
import OrderPage from "./components/OrderPage"
import { Loader2 } from "lucide-react"

const Order = () => {
  const { data, error, isLoading } = useGetReservationsQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-700 font-semibold text-lg mb-2">Lỗi</h3>
          <p className="text-red-600">Có lỗi xảy ra khi tải dữ liệu</p>
        </div>
      </div>
    )
  }

  // API trả về dạng GetReservationResponse, danh sách nằm trong thuộc tính data
  const reservations = data?.data || []
  console.log(
    "Reservation details:",
    reservations.map((r) => ({
      id: r.id,
      customerName: r.detail.customerName,
      customerPhone: r.detail.customerPhone,
    })),
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <OrderPage />
    </div>
  )
}

export default Order

