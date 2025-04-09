"use client"
import { useGetReservationsQuery,useGetReservations1Query } from "@/features/reservation/reservationApiSlice"
import OrderPage from "./components/OrderPage"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useState } from "react"

// Định nghĩa kiểu dữ liệu phân trang
interface PaginationData {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Định nghĩa kiểu dữ liệu đặt bàn
interface ReservationTable {
  id: number;
  tableNumber: string;
}

interface ReservationDetail {
  id: number;
  customerName: string;
  customerPhone: string;
  reservationTime: string | null;
  status: string;
  createBy: string;
  numberOfPeople: number;
  checkIn: string | null;
  checkOut: string | null;
  tables: ReservationTable[];
  timeIn: string;
  timeOut: string | null;
}

interface Reservation {
  id: number;
  timeIn: string;
  timeOut: string | null;
  detail: ReservationDetail;
}

const Order = () => {
  const [page, setPage] = useState(0) // API sử dụng zero-based pagination
  const [pageSize, setPageSize] = useState(10)

  const { data, error, isLoading } = useGetReservations1Query({
    page,
    size: pageSize
  })

  // Xử lý chuyển trang
  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    const pagination = data?.data?.pagination
    if (pagination && page < pagination.totalPages - 1) {
      setPage(page + 1)
    }
  }

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

  // Dữ liệu trả về từ API đã thay đổi cấu trúc
  const reservations = data?.data?.content || [];
  const pagination = data?.data?.pagination || {
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
    first: true,
    last: true
  };
  
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
      
      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-6">
          <Button 
            variant="outline" 
            onClick={handlePreviousPage}
            disabled={page === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Trang trước
          </Button>
          
          <span className="text-sm font-medium">
            Trang {pagination.pageNumber} / {pagination.totalPages}
          </span>
          
          <Button 
            variant="outline" 
            onClick={handleNextPage}
            disabled={page >= pagination.totalPages - 1}
            className="flex items-center gap-1"
          >
            Trang sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default Order

