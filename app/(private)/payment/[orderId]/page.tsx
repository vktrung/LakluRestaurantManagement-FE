"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  useCreatePaymentMutation,
  useProcessCashPaymentMutation,
  useGenerateQrCodeQuery,
  useGetPaymentByIdQuery,
  useGetOrderItemsInOrderQuery,
  useUpdateOrderItemQuantityMutation,
  useCancelPaymentMutation,
  useCompletePaymentMutation
} from "@/features/payment/PaymentApiSlice"
import {
  useGetMenusQuery,
  useGetMenuDishesQuery
} from '@/features/menu/menuApiSlice'
import { useCreateNewItemByOrderIdMutation, useDeleteOrderItemByIdMutation } from '@/features/order/orderApiSlice'
import { formatPrice } from "@/lib/utils"
import { getTokenFromCookie } from "@/utils/token"
import { PaymentStatus } from "@/features/payment/types"
import { toast } from "sonner"

import { PaymentMethod } from "../components/PaymentMethod"
import { VatInput } from "../components/VatInput"
import { VoucherInput } from "../components/VoucherInput"
import { OrderSummary } from "../components/OrderSummary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { CalendarIcon, Plus, Minus, X, Trash2, RefreshCw } from "lucide-react"
import type { OrderItem, PaymentResponse } from "@/features/payment/types"
import type { Menu, MenuItem } from '@/features/menu/types'
import { Checkbox } from "@/components/ui/checkbox"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"


// Định nghĩa kiểu cho dữ liệu trả về từ useGetPaymentByIdQuery
interface PaymentData {
  data: PaymentResponse
}

// Định nghĩa kiểu dữ liệu cho tempBill
interface TempOrderItem {
  id: number;
  dishName: string;
  quantity: number;
  price: string | number;
}

// Thêm hàm kiểm tra và xóa dữ liệu hết hạn
const STORAGE_EXPIRATION = 2 * 60 * 60 * 1000; // 2 giờ tính bằng milliseconds

function setStorageWithExpiry(key: string, value: string) {
  const item = {
    value,
    timestamp: new Date().getTime()
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getStorageWithExpiry(key: string) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();

    // Kiểm tra xem dữ liệu đã hết hạn chưa
    if (now - item.timestamp > STORAGE_EXPIRATION) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

// Cập nhật interface OrderItemDisplay
interface OrderItemDisplay {
  orderItemId: number;
  dishName: string;
  quantity: number;
  price: number;
}

// Cập nhật component OrderItemCard
const OrderItemCard = ({ item, onDelete, onChangeQuantity }: {
  item: OrderItemDisplay;
  onDelete: (id: number) => void;
  onChangeQuantity: (id: number, quantity: number) => void;
}) => {
  return (
    <div className="flex items-center justify-between p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{item.dishName}</h3>
        <p className="text-sm text-gray-500">
          {item.price.toLocaleString()} VND
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Quantity Controls */}
        <div className="flex items-center border rounded-md">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-r-none border-r-0"
            onClick={() => onChangeQuantity(item.orderItemId, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-l-none border-l-0"
            onClick={() => onChangeQuantity(item.orderItemId, item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(item.orderItemId)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function IntegratedPaymentPage() {
  const { orderId } = useParams()
  const router = useRouter()

  // State để kiểm soát hydration
  const [isMounted, setIsMounted] = useState(false)

  // State cho modal xác nhận rời trang
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Kiểm tra orderId
  const orderIdValue = Array.isArray(orderId) ? orderId[0] : orderId
  const orderIdNumber = Number(orderIdValue)

  // Lấy danh sách món ăn có sẵn trong order
  const { data: existingOrderItemsData, isLoading: isExistingOrderItemsLoading, refetch: refetchOrderItems } =
    useGetOrderItemsInOrderQuery(orderIdNumber, {
      skip: !orderIdNumber || isNaN(orderIdNumber)
    })

  // === MENU SELECTION SECTION ===
  const { data: menusData, isLoading: isMenusLoading } = useGetMenusQuery()
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // State cho phân trang menu dishes
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // Lấy danh sách món trong menu
  const {
    data: menuDishesData,
    isLoading: isMenuDishesLoading
  } = useGetMenuDishesQuery(
    {
      menuId: selectedMenuId || 0,
      activeOnly: true,
      page,
      size: pageSize
    },
    { skip: !selectedMenuId }
  )

  // Reset page về 0 khi đổi menu hoặc search
  useEffect(() => {
    setPage(0)
  }, [selectedMenuId, searchTerm])

  // === PAYMENT SECTION ===
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">(() => {
    if (typeof window !== 'undefined') {
      const savedMethod = getStorageWithExpiry(`payment_method_${orderIdValue}`);
      return (savedMethod as "CASH" | "TRANSFER") || "CASH";
    }
    return "CASH";
  })
  const [vatRate, setVatRate] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedVatRate = getStorageWithExpiry(`payment_vatRate_${orderIdValue}`);
      return savedVatRate ? Number(savedVatRate) : 0;
    }
    return 0;
  })
  const [voucherCode, setVoucherCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return getStorageWithExpiry(`payment_voucherCode_${orderIdValue}`) || "";
    }
    return "";
  })
  const [isPaymentCreated, setIsPaymentCreated] = useState(false)
  const [voucherError, setVoucherError] = useState<string | null>(null)
  const [isPaymentCancelled, setIsPaymentCancelled] = useState(false)
  const [shouldPrintBill, setShouldPrintBill] = useState(false)
  const [isCompletingPayment, setIsCompletingPayment] = useState(false)

  // State cho payment
  const [paymentId, setPaymentId] = useState<number | null>(null)
  const [vat, setVat] = useState<string>("0")
  const [totalAmount, setTotalAmount] = useState<string>("0")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [voucherValue, setVoucherValue] = useState<string | number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [paymentCompleted, setPaymentCompleted] = useState(false)

  // Thêm state để quản lý việc in hóa đơn
  const [printBill, setPrintBill] = useState<boolean>(false)
  // Thêm state để theo dõi trạng thái nút hủy
  const [isCancelButtonDisabled, setIsCancelButtonDisabled] = useState<boolean>(false)

  // Thêm state cho modal xác nhận hoàn thành thanh toán
  const [isCompletePaymentModalOpen, setIsCompletePaymentModalOpen] = useState(false);

  // Tạo một phiên bản tùy chỉnh của router để chặn navigation
  const originalPush = useRef(router.push).current;

  // Hàm push tùy chỉnh
  const customRouterPush = useCallback((href: string) => {
    // Các URLs cho phép chuyển hướng ngay mà không cần xác nhận
    const allowedUrls = [pendingNavigation];

    // Kiểm tra nếu cần hiển thị dialog xác nhận
    if (!paymentCompleted && (existingOrderItemsData?.data?.length ?? 0) > 0 && !allowedUrls.includes(href)) {
      setPendingNavigation(href);
      setIsModalOpen(true);
      return Promise.resolve(false);
    }

    // Nếu không cần xác nhận, thực hiện navigation bình thường
    return originalPush(href);
  }, [originalPush, paymentCompleted, existingOrderItemsData?.data, pendingNavigation]);

  // API hooks - Đặt tất cả các hooks ở đây để đảm bảo tính nhất quán
  const [createPayment, { isLoading: isCreating }] = useCreatePaymentMutation()
  const [processCashPayment, { isLoading: isProcessing }] = useProcessCashPaymentMutation()
  const { data: qrCodeData, isLoading: isQrLoading } = useGenerateQrCodeQuery(paymentId || 0, {
    skip: !paymentId || paymentMethod !== "TRANSFER",
  })
  const [cancelPayment, { isLoading: isCancelling }] = useCancelPaymentMutation()
  const { data: paymentData } = useGetPaymentByIdQuery(paymentId || 0, {
    skip: !paymentId || paymentMethod !== "TRANSFER" || paymentStatus === "PAID",
    pollingInterval: 5000,
  }) as { data: PaymentData | undefined }
  const [completePayment] = useCompletePaymentMutation()

  // Add the updateOrderItemQuantity mutation
  const [updateOrderItemQuantity, { isLoading: isUpdatingOrderItem }] = useUpdateOrderItemQuantityMutation()
  const [createNewItemByOrderId, { isLoading: isCreatingNewItem }] = useCreateNewItemByOrderIdMutation()
  const [deleteOrderItemById] = useDeleteOrderItemByIdMutation()

  // Khởi tạo selectedMenuId từ dữ liệu API
  useEffect(() => {
    if (menusData?.data && menusData.data.length > 0 && !selectedMenuId) {
      setSelectedMenuId(menusData.data[0].id)
    }
  }, [menusData, selectedMenuId])

  // Lọc món ăn theo searchTerm
  const menuItems = menuDishesData?.data?.content || []
  const filteredMenuItems = menuItems.filter((item: MenuItem) =>
    item.dish?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Ghi đè phương thức push của  r
  useEffect(() => {
    // @ts-ignore - Override router method temporarily
    router.push = customRouterPush;

    return () => {
      // @ts-ignore - Restore original method when unmounting
      router.push = originalPush;
    };
  }, [router, customRouterPush, originalPush]);

  // Hàm xác nhận chuyển trang
  const confirmNavigation = () => {
    if (pendingNavigation) {
      setIsModalOpen(false);
      // Sử dụng originalPush để tránh gọi lại customRouterPush
      originalPush(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  // Hàm từ chối chuyển trang
  const cancelNavigation = () => {
    setIsModalOpen(false);
    setPendingNavigation(null);
  };

  // Xử lý chuyển trang trong ứng dụng Next.js
  const handleNavigation = useCallback((path: string) => {
    // Nếu thanh toán đã hoàn tất, không cần xác nhận
    if (paymentCompleted) {
      // Sử dụng originalPush thay vì router.push
      originalPush(path);
      return;
    }

    if (selectedMenuId) {
      // Hiển thị modal xác nhận
      setPendingNavigation(path);
      setIsModalOpen(true);
    } else {
      // Nếu không có món nào được chọn, chuyển trang luôn
      originalPush(path);
    }
  }, [originalPush, paymentCompleted, selectedMenuId]);

  // Cập nhật paymentStatus từ paymentData
  useEffect(() => {
    if (paymentData?.data?.paymentStatus) {
      setPaymentStatus(paymentData.data.paymentStatus)
      // Đánh dấu thanh toán đã hoàn tất nếu trạng thái là PAID
      if (paymentData.data.paymentStatus === "PAID") {
        setPaymentCompleted(true)
      }
    }
  }, [paymentData])

  // Update orderItems state based on the fetched data for OrderSummary
  useEffect(() => {
    if (existingOrderItemsData?.data && !isExistingOrderItemsLoading) {
      // Directly use the fetched data structure if OrderSummary is compatible
      // Or map if needed, e.g.:
      const itemsForSummary: OrderItem[] = existingOrderItemsData.data.map(item => ({
        id: item.id, // Use id
        dishName: item.dishName || "Unknown", // Use dishName
        quantity: item.quantity,
        price: item.price?.toString() || "0", // Use price
        orderId: item.orderId,
        menuItemId: item.menuItemId,
      }))
      setOrderItems(itemsForSummary)
    } else {
      setOrderItems([]); // Clear if no data
    }
  }, [existingOrderItemsData, isExistingOrderItemsLoading])

  // Thêm món vào đơn hàng
  const addItemToOrder = async (item: MenuItem) => {
    // Kiểm tra xem đã tạo thanh toán chưa
    if (isPaymentCreated) {
      // Không hiển thị thông báo
      return;
    }

    // Backend handles merging/incrementing, so always call create
    try {
      await createNewItemByOrderId({ // Use the new hook
        orderId: orderIdNumber,
        newOrderItemRequest: { // Pass the request body
          menuItemId: item.id,
          quantity: 1 // Always add 1, backend handles logic
        }
      }).unwrap()

      // Refetch after successful add/update
      refetchOrderItems()
    } catch (error) {
      console.error('Failed to add item to order', error)
      setErrorMessage('Không thể thêm món ăn vào đơn hàng. Vui lòng thử lại.')
    }
  }

  // Thay đổi số lượng món và cập nhật lên server
  const changeItemQuantity = async (itemId: number, newQuantity: number) => {
    if (isPaymentCreated) return;

    // Kiểm tra itemId có tồn tại không
    if (!itemId) {
      console.error('ItemId is undefined or null');
      return;
    }

    // No need to find item in local state
    console.log(`Requesting update for item id=${itemId}, newQuantity=${newQuantity}`);

    try {
      if (newQuantity <= 0) {
        // Nếu số lượng <= 0, cập nhật về 0 (không xóa item)
        console.log(`Updating item ${itemId} to quantity 0`);
        const response = await updateOrderItemQuantity({
          id: itemId,
          data: { quantity: 0 }
        }).unwrap();

        console.log("Update response:", response);

        refetchOrderItems(); // Refetch after update
      } else {
        // Nếu số lượng > 0, cập nhật số lượng mới
        console.log(`Updating item ${itemId} to quantity ${newQuantity}, API call:`, {
          id: itemId,
          data: { quantity: newQuantity }
        });

        const response = await updateOrderItemQuantity({
          id: itemId,
          data: { quantity: newQuantity }
        }).unwrap();

        console.log("Update response:", response);

        refetchOrderItems(); // Refetch after update
      }
    } catch (error) {
      console.error('Failed to update item quantity', error);
      setErrorMessage('Không thể cập nhật số lượng món ăn. Vui lòng thử lại.');
    }
  }

  // Cập nhật hàm handleDeleteItem
  const handleDeleteItem = async (itemId: number | undefined) => {
    // Add check for undefined itemId
    if (itemId === undefined) {
      toast.error("Lỗi: Không thể xóa món ăn với ID không xác định.");
      return;
    }

    // Tìm món ăn cần xóa để hiển thị tên
    const itemToDelete = existingOrderItemsData?.data?.find(
      (item) => item.orderItemId === itemId
    );

    toast.promise(
      new Promise((resolve, reject) => {
        toast.custom((t) => (
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-4">
              Bạn có chắc chắn muốn xóa món {itemToDelete?.dishName || "này"}?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.dismiss(t);
                  reject();
                }}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  toast.dismiss(t);
                  resolve(true);
                }}
              >
                Xóa
              </Button>
            </div>
          </div>
        ), {
          duration: Infinity,
        });
      }).then(async () => {
        try {
          await deleteOrderItemById(itemId).unwrap();
          refetchOrderItems();
          toast.success(`Đã xóa món ${itemToDelete?.dishName || ""} thành công!`, {
            duration: 2000,
            className: "bg-green-50",
          });
        } catch (error: any) {
          const message = error?.data?.message || "Không thể xóa món ăn. Vui lòng thử lại.";
          toast.error(`Lỗi: ${message}`, {
            duration: 3000,
          });
          throw new Error(message);
        }
      })
    );
  };

  // Tính toán subtotal
  const calculateSubtotal = () => {
    // Calculate subtotal directly from fetched data, using price from the nested dish object
    const itemsToSum = existingOrderItemsData?.data || [];
    return itemsToSum.reduce(
      (sum, item) => sum + (Number(item.price || 0) * item.quantity),
      0
    );
  }

  // Thêm useEffect để lưu phương thức thanh toán vào localStorage khi nó thay đổi
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStorageWithExpiry(`payment_method_${orderIdValue}`, paymentMethod);
    }
  }, [paymentMethod, orderIdValue]);

  // Thêm useEffect để lưu VAT rate và voucher code vào localStorage khi chúng thay đổi
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStorageWithExpiry(`payment_vatRate_${orderIdValue}`, vatRate.toString());
    }
  }, [vatRate, orderIdValue]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStorageWithExpiry(`payment_voucherCode_${orderIdValue}`, voucherCode);
    }
  }, [voucherCode, orderIdValue]);

  // Thêm hàm để xóa dữ liệu đã lưu khi thanh toán hoàn tất hoặc hủy
  const clearSavedPaymentData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`payment_method_${orderIdValue}`);
      localStorage.removeItem(`payment_vatRate_${orderIdValue}`);
      localStorage.removeItem(`payment_voucherCode_${orderIdValue}`);
    }
  };

  // Cập nhật hàm handleCreatePayment để xóa dữ liệu đã lưu khi tạo thanh toán thành công

  // Thêm hàm xử lý thanh toán nhanh
  const handleQuickPayment = async () => {
    try {
      setVoucherError(null)
      const result = await createPayment({
        orderId: orderIdNumber,
        paymentMethod,
        vat: vatRate,
        voucherCode: voucherCode || undefined,
      }).unwrap()

      if (result.data?.paymentId) {
        setPaymentId(result.data.paymentId)
        setTotalAmount(String(result.data?.amountPaid || "0"))
        setVat(String(result.data?.vat || "0"))
        setVoucherValue(result.data?.voucherValue || null)
        setIsPaymentCreated(true)

        // Remove auto payment logic for cash
        if (paymentMethod === "CASH") {
          // Set received amount to total amount for convenience
          setReceivedAmount(String(result.data.amountPaid))
        } else {
          toast.info("Đã tạo yêu cầu thanh toán. Vui lòng quét mã QR để thanh toán.")
        }
      }
    } catch (error: any) {
      const message = error?.data?.message || error.message || "Đã xảy ra lỗi không xác định."
      if (message.includes("voucher") || message.includes("Voucher") || message.includes("không tìm thấy")) {
        setVoucherError("Mã giảm giá không hợp lệ hoặc không tồn tại")
        setErrorMessage(null)
      } else {
        if (message.includes("foreign key constraint fails") || message.includes("Đơn hàng đã được thanh toán")) {
          toast.error("Đơn hàng đã được thanh toán, không thể thanh toán lại!")
          setPaymentCompleted(true)
        } else {
          toast.error(`Lỗi tạo thanh toán: ${message}`)
          setVoucherError(null)
        }
      }
    }
  }

  // Xử lý thanh toán tiền mặt
  const [receivedAmount, setReceivedAmount] = useState<string>("")

  const handleCashPayment = async () => {
    if (!paymentId) return
    try {
      const result = await processCashPayment({
        paymentId,
        receivedAmount: Number(receivedAmount),
      }).unwrap()
      toast.success(`Thanh toán thành công: Tiền thừa: ${result.data?.change || "0"}`)
      // Đánh dấu thanh toán đã hoàn tất
      setPaymentCompleted(true)
      // Only print bill if shouldPrintBill is true
      if (shouldPrintBill) {
        handlePrintBill(paymentId)
      }
    } catch (error: any) {
      const message = error?.data?.message || error.message || "Đã xảy ra lỗi không xác định."
      if (message.includes("foreign key constraint fails") || message.includes("Cannot delete or update a parent row")) {
        toast.error("Đơn hàng đã được thanh toán, không thể thanh toán lại!")
        setPaymentCompleted(true)
      } else {
        setErrorMessage(`Thanh toán thất bại: ${message}`)
      }
    }
  }

  // Hàm in hóa đơn trực tiếp tại trang hiện tại
  const handlePrintBill = (paymentId: number): void => {
    // Check paymentId is available
    if (!paymentId) {
      setErrorMessage('Không tìm thấy thông tin hóa đơn');
      return;
    }

    // Tạo một hàm riêng để fetch dữ liệu bill và in
    const fetchAndPrintBill = async () => {
      try {
        // Fetch dữ liệu bill từ API
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/payments/bill/${paymentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getTokenFromCookie()}`,
          }
        });

        if (!response.ok) {
          throw new Error('Không thể lấy thông tin hóa đơn');
        }

        const billResponse = await response.json();
        const bill = billResponse.data;

        if (!bill) {
          throw new Error('Không thể lấy thông tin hóa đơn');
        }

        // Create a new window with only the bill content
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (!printWindow) {
          alert('Vui lòng cho phép cửa sổ pop-up để in hóa đơn');
          return;
        }

        // Format date
        const date = new Date(bill.date);
        const printFormattedDate = new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(date);

        // Format time function
        const formatTimeForPrint = (dateString: string) => {
          if (!dateString) return "--:--";
          const time = new Date(dateString);
          return new Intl.DateTimeFormat("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(time);
        };

        // Generate the HTML content for the print window
        const printContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hóa đơn - ${bill.orderId}</title>
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
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              
              .grid > div > div.wrap-text {
                white-space: normal;
                word-break: break-word;
                overflow: visible;
                hyphens: auto;
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
                white-space: normal;
                word-break: break-word;
                hyphens: auto;
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
                <h2 class="text-sm font-semibold mt-2 mb-3">HÓA ĐƠN THANH TOÁN</h2>
              </div>

              <!-- Order Info -->
              <div class="grid gap-1 mb-3">
                <div>
                  <div style="width: 50%;">
                    <p class="text-xs">SỐ HĐ: ${bill.orderId}</p>
                    <p class="text-xs">BÀN: ${bill.tableNumber || "—"}</p>
                    <p class="text-xs">GIỜ VÀO: ${formatTimeForPrint(bill.timeIn)}</p>
                  </div>
                  <div style="width: 50%; text-align: right;">
                    <p class="text-xs">NGÀY: ${printFormattedDate}</p>
                    <p class="text-xs">GIỜ RA: ${formatTimeForPrint(bill.timeOut)}</p>
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
              ${bill.orderItems.map((item: { dishName: any; quantity: number; price: number | null | undefined }, index: number) => `
              <div class="grid mb-1">
                <div>
                  <div class="col-span-1 text-xs">${index + 1}</div>
                  <div class="col-span-4 text-xs wrap-text">${item.dishName}</div>
                  <div class="col-span-1 text-xs text-center">${item.quantity}</div>
                  <div class="col-span-3 text-xs text-right font-mono">${formatPrice(item.price ?? 0, { currency: false, minLength: 8 })}</div>
                  <div class="col-span-3 text-xs text-right font-mono">${formatPrice((item.price ?? 0) * item.quantity, { currency: false, minLength: 8 })}</div>
                </div>
              </div>
              `).join('')}

              <!-- Divider -->
              <div class="border-t border-dashed mt-2 mb-2"></div>

              <!-- Payment Summary -->
              <div class="text-right space-y-1 mb-2">
                <p class="text-xs">Thành tiền: <span class="font-mono ml-2">${formatPrice(bill.totalAmount + (bill.voucherValue || 0))}</span></p>
                ${bill.voucherValue > 0 ? `<p class="text-xs">Giảm giá voucher: <span class="font-mono ml-2" style="color: red">-${formatPrice(bill.voucherValue)}</span></p>` : ''}
                <p class="text-xs font-bold">Tổng tiền TT: <span class="font-mono ml-2">${formatPrice(bill.totalAmount)}</span></p>
                <p class="text-xs">Tiền khách đưa: <span class="font-mono ml-2">${formatPrice(bill.receivedAmount)}</span></p>
                <p class="text-xs">Tiền trả lại: <span class="font-mono ml-2">${formatPrice(bill.change)}</span></p>
              </div>

              <!-- Footer -->
              <div class="text-center mt-3">
                <p class="text-xs">Cảm ơn quý khách và hẹn gặp lại!</p>
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

        // Write to the new window and print
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
      } catch (error) {
        console.error('Error printing bill:', error);
        setErrorMessage('Có lỗi xảy ra khi in hóa đơn');
      }
    };

    // Execute the print function
    fetchAndPrintBill();
  };

  // Thêm useEffect để hiển thị dialog khi refresh hoặc đóng tab browser
  useEffect(() => {
    // Hàm xử lý trước khi rời trang
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Chỉ hiển thị xác nhận nếu chưa thanh toán và có thông tin cần lưu
      if (!paymentCompleted && (existingOrderItemsData?.data?.length ?? 0) > 0) {
        // Chuẩn message cho các trình duyệt modern
        const message = "Bạn có chắc chắn muốn rời khỏi trang? Thông tin thanh toán có thể bị mất.";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    // Thêm event listener khi component mount
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [paymentCompleted, existingOrderItemsData?.data]);

  // Lắng nghe tất cả các events click trên các thẻ <a> trong trang
  useEffect(() => {
    // Bỏ qua nếu thanh toán đã hoàn tất hoặc không có items
    if (paymentCompleted || (existingOrderItemsData?.data?.length ?? 0) === 0) {
      return;
    }

    // Hàm xử lý khi click vào link
    const handleLinkClick = (e: MouseEvent) => {
      // Bắt sự kiện click trên thẻ <a>
      const target = e.target as HTMLElement;
      const linkElement = target.closest('a');

      if (linkElement && pageRef.current?.contains(linkElement)) {
        // Lấy href từ link
        const href = linkElement.getAttribute('href');

        // Bỏ qua nếu là các links đặc biệt
        if (href && href !== '#' && !href.startsWith('tel:') && !href.startsWith('mailto:')) {
          e.preventDefault();
          setPendingNavigation(href);
          setIsModalOpen(true);
        }
      }
    };

    // Gắn event listener vào document
    document.addEventListener('click', handleLinkClick);

    // Clean up
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, [paymentCompleted, existingOrderItemsData?.data]);

  // Tránh render trước khi hydration hoàn tất
  if (!isMounted) {
    return null
  }

  const subtotal = calculateSubtotal()

  // Thêm hàm xử lý hủy thanh toán
  const handleCancelPayment = async () => {
    if (!paymentId) return;

    try {
      setIsCancelButtonDisabled(true);
      await cancelPayment(paymentId).unwrap();
      setErrorMessage("Đã hủy thanh toán thành công");
      setPaymentCompleted(false);
      setIsPaymentCancelled(true);
      // Xóa dữ liệu đã lưu khi hủy thanh toán
      clearSavedPaymentData();
      // Chuyển hướng về trang danh sách đơn hàng sau 2 giây
      setTimeout(() => {
        handleNavigation('/cashier-order-2/order');
      }, 2000);
    } catch (error: any) {
      const message = error?.data?.message || error.message || "Đã xảy ra lỗi không xác định.";
      if (message.includes("foreign key constraint fails") || message.includes("Cannot delete or update a parent row")) {
        toast.error("Đơn hàng đã được thanh toán, không thể hủy thanh toán!");
        setPaymentCompleted(true);
        setIsCancelButtonDisabled(true);
      } else {
        setErrorMessage(`Lỗi hủy thanh toán: ${message}`);
        setIsCancelButtonDisabled(false);
      }
    }
  };

  // Thêm hàm xử lý hoàn thành thanh toán
  const handleCompletePayment = async () => {
    if (!paymentId) return;

    try {
      setIsCompletingPayment(true);
      await completePayment(paymentId).unwrap();
      toast.success("Hoàn thành thanh toán thành công");
      setPaymentStatus("PAID");
      setPaymentCompleted(true);
    } catch (error: any) {
      const message = error?.data?.message || error.message || "Đã xảy ra lỗi không xác định.";
      toast.error(`Lỗi hoàn thành thanh toán: ${message}`);
    } finally {
      setIsCompletingPayment(false);
      setIsCompletePaymentModalOpen(false);
    }
  };

  return (
    <div className="container mx-auto p-4" ref={pageRef}>
      {/* Modal xác nhận rời trang */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Xác nhận rời khỏi trang</h3>
              <button
                onClick={cancelNavigation}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">Bạn có chắc chắn muốn rời khỏi trang thanh toán? Thông tin thanh toán có thể bị mất.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={cancelNavigation}
              >
                Ở lại
              </Button>
              <Button
                variant="destructive"
                onClick={confirmNavigation}
              >
                Rời khỏi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận hoàn thành thanh toán */}
      {isCompletePaymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Xác nhận hoàn thành thanh toán</h3>
              <button
                onClick={() => setIsCompletePaymentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">Bạn có chắc chắn muốn hoàn thành thanh toán này? Hành động này không thể hoàn tác.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsCompletePaymentModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                variant="default"
                onClick={handleCompletePayment}
                disabled={isCompletingPayment}
              >
                {isCompletingPayment ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          className={`mb-4 p-4 rounded-lg shadow-sm flex items-center gap-2 ${errorMessage.includes("thành công") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
        >
          {errorMessage.includes("thành công") ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Menu Selection Column */}
        <div className="lg:w-2/3">
          <Card className="shadow-lg">
            <CardHeader className="bg-muted/30">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">
                  Chọn món
                </CardTitle>
                <Input
                  placeholder="Tìm kiếm món ăn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Menu Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {isMenusLoading ? (
                  <div>Đang tải menu...</div>
                ) : (
                  menusData?.data
                    ?.filter((menu: Menu) => menu.status === "ENABLE")
                    .map((menu: Menu) => (
                      <Button
                        key={menu.id}
                        onClick={() => setSelectedMenuId(menu.id)}
                        variant={selectedMenuId === menu.id ? 'default' : 'outline'}
                      >
                        {menu.name}
                      </Button>
                    ))
                )}
              </div>

              {/* Menu Items */}
              {isMenuDishesLoading ? (
                <div>Đang tải món ăn...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredMenuItems.length === 0 ? (
                      <div className="col-span-full text-center p-8 text-gray-500">
                        Không tìm thấy món ăn nào
                      </div>
                    ) : (
                      filteredMenuItems.map((item: MenuItem) => (
                        <Card key={item.id} className="overflow-hidden">
                          <div className="relative h-32 w-full bg-gray-100">
                            {item.dish?.images && item.dish.images.length > 0 ? (
                              <Image
                                src={item.dish.images[0]?.link || '/placeholder.jpg'}
                                alt={item.dish?.name || 'Menu item'}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full bg-gray-200">
                                <CalendarIcon className="h-10 w-10 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-medium">{item.dish?.name || 'Không có tên'}</h3>
                            <p className="text-sm text-gray-500 mt-1">{item.price.toLocaleString('vi-VN')} VND</p>
                            <Button
                              onClick={() => addItemToOrder(item)}
                              className="w-full mt-2"
                              size="sm"
                              disabled={isCreatingNewItem || isUpdatingOrderItem || isPaymentCreated || isPaymentCancelled}
                            >
                              {isCreatingNewItem ? "Đang thêm..." : "Thêm vào order"}
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                  {/* Pagination Controls */}
                  {menuDishesData?.data?.pagination && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setPage(page - 1)}
                              className={`hover:bg-muted/50 transition-colors cursor-pointer ${page === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                              tabIndex={page === 0 ? -1 : 0}
                              aria-disabled={page === 0}
                            />
                          </PaginationItem>
                          {/* Trang đầu và dấu ... nếu cần */}
                          {page > 1 && (
                            <>
                              <PaginationItem>
                                <PaginationLink onClick={() => setPage(0)} className="hover:bg-muted/50 transition-colors cursor-pointer">
                                  1
                                </PaginationLink>
                              </PaginationItem>
                              {page > 2 && (
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )}
                            </>
                          )}
                          {/* Trang hiện tại và lân cận */}
                          {Array.from({ length: 3 }, (_, i) => page - 1 + i)
                            .filter(p => p >= 0 && p < menuDishesData.data.pagination.totalPages)
                            .map(p => (
                              <PaginationItem key={p}>
                                <PaginationLink
                                  isActive={p === page}
                                  onClick={() => setPage(p)}
                                  className={p === page ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm" : "hover:bg-muted/50 transition-colors cursor-pointer"}
                                >
                                  {p + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                          {/* Dấu ... và trang cuối nếu cần */}
                          {page < menuDishesData.data.pagination.totalPages - 2 && (
                            <>
                              {page < menuDishesData.data.pagination.totalPages - 3 && (
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )}
                              <PaginationItem>
                                <PaginationLink onClick={() => setPage(menuDishesData.data.pagination.totalPages - 1)} className="hover:bg-muted/50 transition-colors cursor-pointer">
                                  {menuDishesData.data.pagination.totalPages}
                                </PaginationLink>
                              </PaginationItem>
                            </>
                          )}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setPage(page + 1)}
                              className={`hover:bg-muted/50 transition-colors cursor-pointer ${page + 1 >= menuDishesData.data.pagination.totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                              tabIndex={page + 1 >= menuDishesData.data.pagination.totalPages ? -1 : 0}
                              aria-disabled={page + 1 >= menuDishesData.data.pagination.totalPages}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Column */}
        <div className="lg:w-1/3">
          <Card className="shadow-lg border-t-4 border-t-primary">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-xl font-bold">Thanh toán</CardTitle>
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium text-sm">
                Hóa Đơn: {orderIdValue || "Mới"}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Selected Items List */}
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 border-b">
                  <h3 className="font-medium">Món đã chọn</h3>
                  {isPaymentCreated && (
                    <p className="text-sm text-orange-600 mt-1">
                      Không thể thay đổi món ăn sau khi đã tạo thanh toán
                    </p>
                  )}
                </div>
                <div className="divide-y">
                  {isExistingOrderItemsLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      Đang tải danh sách món...
                    </div>
                  ) : (existingOrderItemsData?.data?.length ?? 0) === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Chưa có món nào được chọn
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {existingOrderItemsData?.data?.map((item) => (
                        <OrderItemCard
                          key={item.orderItemId}
                          item={{
                            orderItemId: item.orderItemId ?? 0,
                            dishName: item.dishName,
                            quantity: item.quantity,
                            price: Number(item.price)
                          }}
                          onDelete={handleDeleteItem}
                          onChangeQuantity={changeItemQuantity}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-muted/10 p-3 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Tạm tính:</span>
                    <span>{subtotal.toLocaleString('vi-VN')} VND</span>
                  </div>
                </div>
              </div>

              {!isPaymentCreated ? (
                <div className="space-y-4">
                  <PaymentMethod selectedMethod={paymentMethod} onChange={setPaymentMethod} />
                  <div className="grid md:grid-cols-2 gap-4">
                    <VatInput vatRate={vatRate} vatAmount={vat} onChange={setVatRate} />
                    <VoucherInput
                      voucherCode={voucherCode}
                      onChange={(code) => {
                        setVoucherCode(code)
                        setVoucherError(null)
                      }}
                      error={voucherError}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="printBill"
                      checked={shouldPrintBill}
                      onCheckedChange={(checked) => setShouldPrintBill(checked as boolean)}
                    />
                    <label
                      htmlFor="printBill"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      In hóa đơn sau khi thanh toán
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleQuickPayment}
                      disabled={isCreating || (existingOrderItemsData?.data?.length ?? 0) === 0 || isPaymentCancelled}
                      className="flex-1 bg-primary py-6 text-lg"
                    >
                      {isCreating ? "Đang xử lý..." : "Thanh toán"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h3 className="text-green-800 font-medium mb-2">
                      Đã tạo thanh toán thành công
                    </h3>
                    <p className="text-green-600 text-sm">Vui lòng hoàn tất thanh toán</p>
                  </div>

                  <div className="bg-muted/10 rounded-lg p-4 border">
                    <OrderSummary
                      total={Number(totalAmount).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                      vat={vat}
                      orderItems={orderItems}
                      voucherValue={voucherValue}
                    />
                  </div>

                  {paymentStatus !== "PAID" && (
                    <Button
                      variant="destructive"
                      onClick={handleCancelPayment}
                      disabled={isCancelling || isCancelButtonDisabled || paymentCompleted}
                      className="w-full"
                    >
                      {isCancelling ? "Đang hủy..." : "Hủy thanh toán"}
                    </Button>
                  )}

                  {paymentMethod === "CASH" ? (
                    <div className="bg-white rounded-lg border shadow-sm p-4">
                      <h3 className="font-medium text-lg mb-4">
                        Thanh toán tiền mặt
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="receivedAmount" className="block text-sm font-medium mb-1">
                            Số tiền nhận được
                          </label>
                          <input
                            id="receivedAmount"
                            type="number"
                            value={receivedAmount}
                            onChange={(e) => setReceivedAmount(e.target.value)}
                            placeholder="Nhập số tiền nhận được"
                            className="w-full p-2 border rounded"
                            required
                            disabled={isPaymentCancelled || paymentCompleted}
                          />
                          {receivedAmount && Number(receivedAmount) >= Number(totalAmount) && (
                            <div className="mt-2 text-sm text-green-600">
                              Tiền thừa trả lại: {(Number(receivedAmount) - Number(totalAmount)).toLocaleString()} VND
                            </div>
                          )}
                        </div>

                        {errorMessage && errorMessage.includes("thành công") && shouldPrintBill ? (
                          <div className="space-y-3">
                            <Button
                              onClick={() => {
                                if (paymentId) {
                                  handlePrintBill(paymentId);
                                }
                              }}
                              className="w-full bg-green-600 hover:bg-green-700"
                              disabled={isPaymentCancelled}
                            >
                              In hóa đơn
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={handleCashPayment}
                            disabled={
                              isProcessing ||
                              !paymentId ||
                              !receivedAmount ||
                              Number(receivedAmount) < Number(totalAmount) ||
                              isPaymentCancelled ||
                              paymentCompleted
                            }
                            className="w-full"
                          >
                            {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border shadow-sm p-4">
                      <h3 className="font-medium text-lg mb-4">
                        Thanh toán chuyển khoản
                      </h3>
                      <div className="text-center space-y-4">
                        {isQrLoading ? (
                          <div>Đang tải mã QR...</div>
                        ) : qrCodeData?.data?.qrCodeUrl && paymentStatus !== "FAILED" ? (
                          <div className="flex flex-col items-center">
                            <p className="mb-4">Quét mã QR để thanh toán:</p>
                            <Image
                              src={qrCodeData.data.qrCodeUrl}
                              alt="QR Code"
                              width={200}
                              height={200}
                              className="mx-auto"
                            />
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-red-600 font-medium text-sm">
                                ⚠️ QUÝ KHÁCH VUI LÒNG KHÔNG THAY ĐỔI SỐ TIỀN HOẶC NỘI DUNG THANH TOÁN
                              </p>
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                              Hệ thống sẽ tự động cập nhật khi nhận được thanh toán
                            </p>

                            {paymentStatus === "PENDING" && (
                              <Button
                                onClick={() => setIsCompletePaymentModalOpen(true)}
                                disabled={isCompletingPayment || isPaymentCancelled}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Hoàn thành thanh toán
                              </Button>
                            )}

                            <div className="mt-4 py-2 px-4 rounded-full flex items-center justify-center gap-2">
                              {paymentStatus === "PENDING" && (
                                <div className="bg-yellow-50 text-yellow-700 py-2 px-4 rounded-full flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Đang chờ thanh toán...</span>
                                </div>
                              )}
                              {paymentStatus === "PAID" && (
                                <div className="bg-green-50 text-green-700 py-2 px-4 rounded-full flex items-center">
                                  <svg className="h-5 w-5 mr-2 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span>Thanh toán thành công!</span>
                                </div>
                              )}
                            </div>

                            {paymentStatus === "PENDING" && (
                              <div className="mt-4 text-sm bg-blue-50 p-3 rounded-md text-blue-700 text-left">
                                <p className="font-medium mb-1">Lưu ý:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>Vui lòng không đóng trang này trong quá trình thanh toán</li>
                                  <li>Thanh toán sẽ được cập nhật tự động sau vài giây</li>
                                  <li>Sau khi thanh toán thành công, hệ thống sẽ hiển thị thông báo</li>
                                </ul>
                              </div>
                            )}

                            {paymentStatus === "PAID" && shouldPrintBill && (
                              <div className="mt-4 flex flex-col space-y-3">
                                <Button
                                  onClick={() => {
                                    if (paymentId) {
                                      handlePrintBill(paymentId);
                                    }
                                  }}
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={isPaymentCancelled}
                                >
                                  In hóa đơn
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : paymentStatus === "FAILED" ? (
                          <div className="flex flex-col items-center">
                            <div className="bg-red-50 text-red-700 py-3 px-4 rounded-lg flex items-center mb-4">
                              <svg className="h-6 w-6 mr-2 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              <span>Thanh toán đã thất bại</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                              Giao dịch không hoàn tất: Quá thời gian chờ thanh toán.
                            </p>
                          </div>
                        ) : (
                          <div>Không có mã QR</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => handleNavigation('/cashier-order-2/order')}
                className="w-full"
              >
                Quay lại danh sách đơn hàng
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}