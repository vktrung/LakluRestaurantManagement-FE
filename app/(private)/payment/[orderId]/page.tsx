"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  useCreatePaymentMutation,
  useProcessCashPaymentMutation,
  useGenerateQrCodeQuery,
  useGetPaymentByIdQuery,
  useGetOrderItemsInOrderQuery,
  useUpdateOrderItemQuantityMutation,
  useCreateOrderItemMutation,
} from "@/features/payment/paymentApiSlice"
import {
  useGetMenusQuery,
  useGetMenuItemByIdQuery,
} from '@/features/menu/menuApiSlice'
import { useGetDishByIdQuery } from '@/features/dish/dishApiSlice'
import { useGetCategoryByIdQuery } from '@/features/category/categoryApiSlice'

import { OrderItems } from "../components/OrderItems"
import { PaymentMethod } from "../components/PaymentMethod"
import { VatInput } from "../components/VatInput"
import { VoucherInput } from "../components/VoucherInput"
import { OrderSummary } from "../components/OrderSummary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { CalendarIcon, Plus, Minus } from "lucide-react"
import type { OrderItem, PaymentResponse } from "@/features/payment/types"
import type { Menu, MenuItem } from '@/features/menu/types'

// Extended MenuItem interface with additional properties needed for our component
interface ExtendedMenuItem extends MenuItem {
  quantity: number
  orderId?: number
  statusLabel?: string
  menuItemId?: number
}

// Định nghĩa kiểu cho dữ liệu trả về từ useGetPaymentByIdQuery
interface PaymentData {
  data: PaymentResponse
}

export default function IntegratedPaymentPage() {
  const { orderId } = useParams()
  const router = useRouter()

  // State để kiểm soát hydration
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Kiểm tra orderId
  const orderIdValue = Array.isArray(orderId) ? orderId[0] : orderId
  const orderIdNumber = Number(orderIdValue)

  // Lấy danh sách món ăn có sẵn trong order
  const { data: existingOrderItemsData, isLoading: isExistingOrderItemsLoading } = 
    useGetOrderItemsInOrderQuery(orderIdNumber, {
    skip: !orderIdNumber || isNaN(orderIdNumber)
  })

  // === MENU SELECTION SECTION ===
  const { data: menusData, isLoading: isMenusLoading } = useGetMenusQuery()
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<ExtendedMenuItem[]>([])

  // Lấy danh sách món trong menu
  const { data: menuData, isLoading: isMenuLoading } = useGetMenuItemByIdQuery(
    selectedMenuId || 0,
    { skip: !selectedMenuId }
  )

  // === PAYMENT SECTION ===
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">("CASH")
  const [vatRate, setVatRate] = useState<number>(0)
  const [voucherCode, setVoucherCode] = useState<string>("")
  const [isPaymentCreated, setIsPaymentCreated] = useState(false)

  // State cho payment
  const [paymentId, setPaymentId] = useState<number | null>(null)
  const [vat, setVat] = useState<string>("0")
  const [totalAmount, setTotalAmount] = useState<string>("0")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "PAID" | null>(null)

  // API hooks
  const [createPayment, { isLoading: isCreating }] = useCreatePaymentMutation()
  const [processCashPayment, { isLoading: isProcessing }] = useProcessCashPaymentMutation()
  const { data: qrCodeData, isLoading: isQrLoading } = useGenerateQrCodeQuery(paymentId || 0, {
    skip: !paymentId || paymentMethod !== "TRANSFER",
  })

  // Polling để kiểm tra trạng thái payment (cho thanh toán chuyển khoản)
  const { data: paymentData } = useGetPaymentByIdQuery(paymentId || 0, {
    skip: !paymentId || paymentMethod !== "TRANSFER" || paymentStatus === "PAID",
    pollingInterval: 5000,
  }) as { data: PaymentData | undefined }

  // Add the updateOrderItemQuantity mutation
  const [updateOrderItemQuantity, { isLoading: isUpdatingOrderItem }] = useUpdateOrderItemQuantityMutation()
  const [createOrderItem, { isLoading: isCreatingOrderItem }] = useCreateOrderItemMutation()

  // Khởi tạo selectedMenuId từ dữ liệu API
  useEffect(() => {
    if (menusData?.data && menusData.data.length > 0 && !selectedMenuId) {
      setSelectedMenuId(menusData.data[0].id)
    }
  }, [menusData, selectedMenuId])

  // Lọc món ăn theo searchTerm
  const menuItems = menuData?.data?.menuItems || []
  const filteredMenuItems = menuItems.filter((item: MenuItem) =>
    item.dish?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Cập nhật paymentStatus từ paymentData
  useEffect(() => {
    if (paymentData?.data?.paymentStatus) {
      setPaymentStatus(paymentData.data.paymentStatus)
    }
  }, [paymentData])

  // Khởi tạo selectedItems từ existingOrderItemsData khi có dữ liệu
  useEffect(() => {
    if (existingOrderItemsData?.data && existingOrderItemsData.data.length > 0 && selectedItems.length === 0) {
      console.log("Existing order items:", existingOrderItemsData.data);
      // Chuyển đổi dữ liệu từ API thành định dạng selectedItems
      const existingItems = existingOrderItemsData.data.map((item: any) => {
        // Đảm bảo id không bao giờ undefined - sử dụng orderItemId nếu tồn tại
        if (!item.id && !item.orderItemId) {
          console.error("Found item without id or orderItemId:", item);
        }
        
        // Ưu tiên sử dụng id, nếu không có thì dùng orderItemId
        const itemId = item.id || item.orderItemId || 0;
        
        return {
          id: itemId, // Đảm bảo id luôn là số, không bao giờ undefined
          dishId: item.menuItemId || 0,
          dish: { name: item.dishName || "Unknown" },
          price: Number(item.price || 0),
          quantity: item.quantity || 0,
          menuItemId: item.menuItemId || 0,
          orderId: item.orderId || 0,
          // Các trường bắt buộc của MenuItem
          status: "enable",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Thêm các trường cần thiết khác
          menuId: 0, 
          categoryId: 0
        } as ExtendedMenuItem;
      });
      
      console.log("Converted to selectedItems:", existingItems);
      setSelectedItems(existingItems);
      
      // Đồng thời cập nhật orderItems để đảm bảo tính nhất quán
      setOrderItems(existingOrderItemsData.data);
    }
  }, [existingOrderItemsData, selectedItems.length]);

  // Chuyển đổi selectedItems thành orderItems khi người dùng thay đổi món ăn
  useEffect(() => {
    // Chỉ cập nhật nếu có selectedItems và không phải lần đầu load dữ liệu
    if (selectedItems.length > 0 && !isExistingOrderItemsLoading) {
      const items: OrderItem[] = selectedItems.map(item => ({
        id: item.id,
        dishName: item.dish?.name || "Unknown",
        quantity: item.quantity,
        price: item.price.toString(),
        orderId: item.orderId,
        menuItemId: item.menuItemId,
        statusLabel: item.statusLabel,
      }))
      setOrderItems(items)
    }
  }, [selectedItems, isExistingOrderItemsLoading])

  // Thêm món vào đơn hàng
  const addItemToOrder = async (item: MenuItem) => {
    // Kiểm tra xem đã tạo thanh toán chưa
    if (isPaymentCreated) {
      // Không hiển thị thông báo
      return;
    }
    
    // Kiểm tra xem món ăn đã tồn tại trong danh sách chưa
    const existingItem = selectedItems.find(i => i.menuItemId === item.id)
    
    if (existingItem) {
      // Nếu món ăn đã tồn tại, tăng số lượng
      await changeItemQuantity(existingItem.id, existingItem.quantity + 1)
      // Không hiển thị thông báo
    } else {
      // Nếu món ăn chưa tồn tại, tạo mới
      try {
        const result = await createOrderItem({
          orderId: orderIdNumber,
          menuItemId: item.id,
          quantity: 1
        }).unwrap()
        
        if (result.data) {
          // Thêm món ăn mới vào danh sách selectedItems
          const newItem: ExtendedMenuItem = {
            id: result.data.id ?? 0,
            dishId: item.dishId,
            dish: item.dish,
            price: item.price,
            quantity: 1,
            menuItemId: item.id,
            orderId: orderIdNumber,
            menuId: item.menuId,
            categoryId: item.categoryId,
            // Các trường bắt buộc của MenuItem
            status: item.status,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          }
          
          setSelectedItems(prev => [...prev, newItem])
          // Không hiển thị thông báo
        }
      } catch (error) {
        console.error('Failed to add item to order', error)
        setErrorMessage('Không thể thêm món ăn vào đơn hàng. Vui lòng thử lại.')
      }
    }
  }

  // Thay đổi số lượng món và cập nhật lên server
  const changeItemQuantity = async (itemId: number, newQuantity: number) => {
    // Kiểm tra xem đã tạo thanh toán chưa
    if (isPaymentCreated) {
      // Không hiển thị thông báo
      return;
    }
    
    // Kiểm tra itemId có tồn tại không
    if (!itemId) {
      console.error('ItemId is undefined or null');
      // Không hiển thị thông báo
      return;
    }
    
    // Tìm item cần thay đổi
    const item = selectedItems.find(item => item.id === itemId);
    
    if (!item) {
      console.error(`Item with id ${itemId} not found`);
      return;
    }
    
    console.log(`Starting to update item with id=${itemId}, newQuantity=${newQuantity}`, item);

    try {
      if (newQuantity <= 0) {
        // Nếu số lượng <= 0, cập nhật về 0 (không xóa item)
        console.log(`Updating item ${itemId} to quantity 0`);
        const response = await updateOrderItemQuantity({
          id: itemId,
          data: { quantity: 0 }
        }).unwrap();
        
        console.log("Update response:", response);
        
        // Cập nhật UI bằng cách loại bỏ item này
        setSelectedItems(prev => prev.filter(item => item.id !== itemId));
        // Không hiển thị thông báo
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
        
        // Cập nhật UI
        setSelectedItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
        
        // Không hiển thị thông báo thành công
      }
    } catch (error) {
      console.error('Failed to update item quantity', error);
      setErrorMessage('Không thể cập nhật số lượng món ăn. Vui lòng thử lại.');
    }
  }

  // Tính toán subtotal
  const calculateSubtotal = () => {
    return selectedItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    )
  }

  // Hàm tạo payment khi thu ngân nhấn nút xác nhận
  const handleCreatePayment = async () => {
    try {
      const result = await createPayment({
        orderId: orderIdNumber,
        paymentMethod,
        vat: vatRate,
        voucher: voucherCode || undefined,
      }).unwrap()
      
      if (result.data?.paymentId) {
        setPaymentId(result.data.paymentId)
      }
      
      // Lấy thông tin từ backend
      setTotalAmount(result.data?.amountPaid || "0")
      setVat(result.data?.vat || "0")
      setIsPaymentCreated(true)
    } catch (error: any) {
      const message = error?.data?.message || error.message || "Đã xảy ra lỗi không xác định."
      setErrorMessage(`Lỗi tạo thanh toán: ${message}`)
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
      setErrorMessage(`Thanh toán thành công: Tiền thối: ${result.data?.change || "0"}`)
    } catch (error: any) {
      const message = error?.data?.message || error.message || "Đã xảy ra lỗi không xác định."
      setErrorMessage(`Thanh toán thất bại: ${message}`)
    }
  }

  // Tránh render trước khi hydration hoàn tất
  if (!isMounted) {
    return null
  }

  const subtotal = calculateSubtotal()

  return (
    <div className="container mx-auto p-4">
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
                  menusData?.data?.map((menu: Menu) => (
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
              {isMenuLoading ? (
                <div>Đang tải món ăn...</div>
              ) : (
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
                            disabled={isCreatingOrderItem || isUpdatingOrderItem || isPaymentCreated}
                          >
                            {isCreatingOrderItem ? "Đang thêm..." : "Thêm vào order"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
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
                  ) : selectedItems.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Chưa có món nào được chọn
                    </div>
                  ) : (
                    selectedItems.map(item => (
                      <div key={item.id} className="p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{item.dish?.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.price.toLocaleString('vi-VN')} VND × {item.quantity}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => {
                              if (!item.id) {
                                console.error('Item has no id', item);
                                setErrorMessage('Lỗi: Không thể giảm số lượng món ăn không có ID');
                                return;
                              }
                              changeItemQuantity(item.id, item.quantity - 1);
                            }}
                            disabled={isUpdatingOrderItem || isPaymentCreated}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => {
                              if (!item.id) {
                                console.error('Item has no id', item);
                                setErrorMessage('Lỗi: Không thể tăng số lượng món ăn không có ID');
                                return;
                              }
                              changeItemQuantity(item.id, item.quantity + 1);
                            }}
                            disabled={isUpdatingOrderItem || isPaymentCreated}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
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
                    <VoucherInput voucherCode={voucherCode} onChange={setVoucherCode} />
                  </div>
                  <Button
                    onClick={handleCreatePayment}
                    disabled={isCreating || selectedItems.length === 0}
                    className="w-full py-6 text-lg mt-6"
                  >
                    {isCreating ? "Đang tạo thanh toán..." : "Tạo thanh toán"}
                  </Button>
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
                    />
                  </div>

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
                          />
                          {receivedAmount && Number(receivedAmount) >= Number(totalAmount) && (
                            <div className="mt-2 text-sm text-green-600">
                              Tiền thối: {(Number(receivedAmount) - Number(totalAmount)).toLocaleString()} VND
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={handleCashPayment}
                          disabled={
                            isProcessing || !paymentId || !receivedAmount || Number(receivedAmount) < Number(totalAmount)
                          }
                          className="w-full"
                        >
                          {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
                        </Button>
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
                        ) : qrCodeData?.data?.qrCodeUrl ? (
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
                            
                            {/* Hiển thị trạng thái thanh toán */}
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
                              {!paymentStatus && (
                                <div className="bg-blue-50 text-blue-700 py-2 px-4 rounded-full flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Đang kiểm tra trạng thái...</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Hướng dẫn bổ sung khi đang chờ thanh toán */}
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
                            
                            {/* Hành động sau khi thanh toán thành công */}
                            {paymentStatus === "PAID" && (
                              <Button
                                onClick={() => router.push(`/cashier-order`)}
                                className="mt-4 bg-green-600 hover:bg-green-700"
                              >
                                Hoàn tất và quay lại danh sách đơn hàng
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="text-red-500">
                            <p>Không thể tạo mã QR</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => router.push(`/cashier-order`)}
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