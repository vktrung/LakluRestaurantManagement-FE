"use client"
import { useGetActiveReservationsByTimeRangeQuery } from "@/features/reservation/reservationApiSlice"
import OrderPage from "./components/OrderPage"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, Calendar, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useRouter, usePathname } from "next/navigation"

// Định nghĩa kiểu dữ liệu phân trang
interface PaginationData {
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

// Định nghĩa kiểu dữ liệu đặt bàn
interface ReservationTable {
  id: number
  tableNumber: string
}

interface ReservationDetail {
  id: number
  customerName: string
  customerPhone: string
  reservationTime: string | null
  status: string
  createBy: string
  numberOfPeople: number
  checkIn: string | null
  checkOut: string | null
  tables: ReservationTable[]
  timeIn: string
  timeOut: string | null
}

interface Reservation {
  id: number
  timeIn: string
  timeOut: string | null
  detail: ReservationDetail
}

const Order = () => {
  const router = useRouter()
  const pathname = usePathname()

  // Phân trang
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(12)
  const [shouldRefetch, setShouldRefetch] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Sử dụng API hook để lấy dữ liệu đặt bàn
  const {
    data: timeRangeResponse,
    error: timeRangeError,
    isLoading: isTimeRangeLoading,
    refetch,
  } = useGetActiveReservationsByTimeRangeQuery(
    {
      timeRange: "today",
      page: currentPage,
      size: pageSize,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  )

  // Fetch lại dữ liệu khi component được mount hoặc focus
  useEffect(() => {
    const fetchData = async () => {
      await refetch()
      setShouldRefetch(false)
      setIsRefreshing(false)
    }

    // Fetch khi component mount hoặc shouldRefetch thay đổi
    if (shouldRefetch) {
      fetchData()
    }

    // Fetch khi focus lại tab
    const handleFocus = () => {
      setShouldRefetch(true)
    }

    // Fetch khi route thay đổi (quay lại từ trang chi tiết)
    const handleRouteChange = () => {
      setShouldRefetch(true)
    }

    window.addEventListener("focus", handleFocus)
    window.addEventListener("popstate", handleRouteChange)

    // Kích hoạt fetch ngay khi mount
    setShouldRefetch(true)

    return () => {
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("popstate", handleRouteChange)
    }
  }, [refetch, pathname])

  // Lấy dữ liệu đặt bàn phân trang
  const pagedData = timeRangeResponse?.data
  const reservations = pagedData?.content || []
  const pagination = pagedData?.pagination

  // Hiển thị thông báo lỗi nếu có
  if (timeRangeError) {
    toast.error("Không thể tải danh sách đặt bàn. Vui lòng thử lại sau.")
  }

  // Xử lý chuyển trang
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  if (isTimeRangeLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-3 p-8 bg-white rounded-xl shadow-lg">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-slate-700 font-medium text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Quản lý đặt bàn</h1>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8">
          <OrderPage reservations={reservations} />
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-6">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="flex items-center gap-2 border-slate-300 hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Trang trước</span>
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium px-3 py-1.5 bg-white rounded-md shadow-sm border border-slate-200">
                {currentPage + 1} / {pagination.totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages - 1}
              className="flex items-center gap-2 border-slate-300 hover:bg-slate-100"
            >
              <span className="hidden sm:inline">Trang sau</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Order
