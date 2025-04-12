"use client"
import { useGetReservationsByTimeRangeQuery } from "@/features/reservation/reservationApiSlice"
import { TimeRangeType } from "@/features/reservation/type"
import OrderPage from "./components/OrderPage"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useRouter, usePathname } from "next/navigation"

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
  const router = useRouter();
  const pathname = usePathname();
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(12)
  const [shouldRefetch, setShouldRefetch] = useState(false)

  // Sử dụng API hook để lấy dữ liệu đặt bàn
  const { 
    data: timeRangeResponse, 
    error: timeRangeError, 
    isLoading: isTimeRangeLoading,
    refetch
  } = useGetReservationsByTimeRangeQuery({
    timeRange: "today",
    page: currentPage,
    size: pageSize
  }, { 
    refetchOnMountOrArgChange: true 
  })

  // Fetch lại dữ liệu khi component được mount hoặc focus
  useEffect(() => {
    const fetchData = async () => {
      await refetch();
      setShouldRefetch(false);
    };

    // Fetch khi component mount hoặc shouldRefetch thay đổi
    if (shouldRefetch) {
      fetchData();
    }

    // Fetch khi focus lại tab
    const handleFocus = () => {
      setShouldRefetch(true);
    };

    // Fetch khi route thay đổi (quay lại từ trang chi tiết)
    const handleRouteChange = () => {
      setShouldRefetch(true);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('popstate', handleRouteChange);

    // Kích hoạt fetch ngay khi mount
    setShouldRefetch(true);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [refetch, pathname]);

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
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý đặt bàn</h1>
        </div>

        <div className="mb-6">
          <OrderPage reservations={reservations} />
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-6">
            <Button 
              variant="outline" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Trang trước
            </Button>
            
            <span className="text-sm font-medium">
              Trang {currentPage + 1} / {pagination.totalPages}
            </span>
            
            <Button 
              variant="outline" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages - 1}
              className="flex items-center gap-1"
            >
              Trang sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Order

