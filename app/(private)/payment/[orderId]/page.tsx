"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  useCreatePaymentMutation,
  useProcessCashPaymentMutation,
  useGenerateQrCodeQuery,
  useGetPaymentByIdQuery,
} from "@/features/payment/paymentApiSlice"
import { OrderItems } from "../components/OrderItems"
import { PaymentMethod } from "../components/PaymentMethod"
import { VatInput } from "../components/VatInput"
import { VoucherInput } from "../components/VoucherInput"
import { OrderSummary } from "../components/OrderSummary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import type { OrderItem } from "@/features/payment/types"

// Định nghĩa kiểu cho dữ liệu trả về từ useGetPaymentByIdQuery
interface PaymentData {
  data: {
    paymentId: number
    amountPaid: string
    paymentStatus: "PENDING" | "PAID" | "FAILED" // Thêm các trạng thái khác nếu cần
  }
}

export default function PaymentPage() {
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
  if (isNaN(orderIdNumber)) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">Order ID không hợp lệ</p>
      </div>
    )
  }

  // State cho form
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">("CASH")
  const [vatRate, setVatRate] = useState<number>(0)
  const [voucherCode, setVoucherCode] = useState<string>("")
  const [isPaymentCreated, setIsPaymentCreated] = useState(false)

  // State cho payment
  const [paymentId, setPaymentId] = useState<number | null>(null)
  const [totalAmount, setTotalAmount] = useState<string>("0")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "PAID" | "FAILED" | null>(null) // State để lưu trữ paymentStatus

  const [createPayment, { isLoading: isCreating, error: createError }] = useCreatePaymentMutation()
  const [processCashPayment, { isLoading: isProcessing, error: processError }] = useProcessCashPaymentMutation()
  const { data: qrCodeData, isLoading: isQrLoading } = useGenerateQrCodeQuery(paymentId || 0, {
    skip: !paymentId || paymentMethod !== "TRANSFER",
  })

  // Polling để kiểm tra trạng thái payment (cho thanh toán chuyển khoản)
  const { data: paymentData } = useGetPaymentByIdQuery(paymentId || 0, {
    skip: !paymentId || paymentMethod !== "TRANSFER" || paymentStatus === "PAID", // Dùng paymentStatus từ state
    pollingInterval: 5000,
  }) as { data: PaymentData | undefined } // Gán kiểu cho paymentData

  // Cập nhật paymentStatus từ paymentData
  useEffect(() => {
    if (paymentData?.data?.paymentStatus) {
      setPaymentStatus(paymentData.data.paymentStatus)
    }
  }, [paymentData])

  // Hàm tạo payment khi thu ngân nhấn nút xác nhận
  const handleCreatePayment = async () => {
    try {
      const result = await createPayment({
        orderId: orderIdNumber,
        paymentMethod,
        vat: vatRate,
        voucher: voucherCode || undefined,
      }).unwrap()
      setPaymentId(result.data?.paymentId ?? null)
      setTotalAmount(result.data?.amountPaid || "0")
      if (result.data?.orderItems) {
        const validOrderItems = result.data.orderItems.filter(
          (item: OrderItem) => item.dishName && Number(item.price) >= 0 && item.quantity > 0,
        )
        if (validOrderItems.length === 0) {
          throw new Error("Danh sách món ăn không hợp lệ.")
        }
        setOrderItems(validOrderItems)
      } else {
        throw new Error("Không tìm thấy danh sách món ăn cho hóa đơn này.")
      }
      setIsPaymentCreated(true)
    } catch (error: any) {
      const message = error?.data?.message || error.message || "Đã xảy ra lỗi không xác định."
      setErrorMessage(`Lỗi tạo thanh toán: ${message}`)
    }
  }

  // Cập nhật totalAmount từ API nếu có (cho thanh toán chuyển khoản)
  useEffect(() => {
    if (paymentData?.data?.amountPaid) {
      setTotalAmount(paymentData.data.amountPaid)
    }
  }, [paymentData])

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

  return (
    <div className="container mx-auto p-4 max-w-4xl">
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
      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardHeader className="bg-muted/30">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
              Thanh toán
            </CardTitle>
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
              Hóa Đơn ID: {orderIdValue}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {!isPaymentCreated ? (
            // Giao diện nhập thông tin trước khi tạo payment
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                <h3 className="text-blue-800 font-medium mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Thông tin thanh toán
                </h3>
                <p className="text-blue-600 text-sm">
                  Vui lòng chọn phương thức thanh toán và điền các thông tin cần thiết
                </p>
              </div>

              <PaymentMethod selectedMethod={paymentMethod} onChange={setPaymentMethod} />
              <div className="grid md:grid-cols-2 gap-4">
                <VatInput vatRate={vatRate} vatAmount="0" onChange={setVatRate} />
                <VoucherInput voucherCode={voucherCode} onChange={setVoucherCode} />
              </div>
              <Button
                onClick={handleCreatePayment}
                disabled={isCreating}
                className="w-full py-6 text-lg mt-6 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang tạo thanh toán...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Tạo thanh toán
                  </>
                )}
              </Button>
            </div>
          ) : (
            // Giao diện sau khi tạo payment
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6">
                <h3 className="text-green-800 font-medium mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Đã tạo thanh toán thành công
                </h3>
                <p className="text-green-600 text-sm">Vui lòng hoàn tất thanh toán bằng phương thức đã chọn</p>
              </div>

              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 border-b">
                  <h3 className="font-medium">Chi tiết đơn hàng</h3>
                </div>
                <OrderItems items={orderItems} />
              </div>

              <div className="bg-muted/10 rounded-lg p-4 border">
                <OrderSummary subtotal={totalAmount} vatAmount="0" total={totalAmount} />
              </div>

              {paymentMethod === "CASH" ? (
                <div className="bg-white rounded-lg border shadow-sm p-5">
                  <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                    Thanh toán tiền mặt
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="receivedAmount" className="block text-sm font-medium mb-1">
                        Số tiền nhận được
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">₫</span>
                        </div>
                        <input
                          id="receivedAmount"
                          type="number"
                          value={receivedAmount}
                          onChange={(e) => setReceivedAmount(e.target.value)}
                          placeholder="Nhập số tiền nhận được"
                          className="pl-7 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50"
                          required
                        />
                      </div>
                      {receivedAmount && Number(receivedAmount) >= Number(totalAmount) && (
                        <div className="mt-2 text-sm text-green-600">
                          Tiền thối: ₫{(Number(receivedAmount) - Number(totalAmount)).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleCashPayment}
                      disabled={
                        isProcessing || !paymentId || !receivedAmount || Number(receivedAmount) < Number(totalAmount)
                      }
                      className="w-full py-5 text-lg"
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Đang xử lý...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Xác nhận thanh toán
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border shadow-sm p-5">
                  <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    Thanh toán chuyển khoản
                  </h3>
                  <div className="text-center space-y-4">
                    {isQrLoading ? (
                      <div className="flex flex-col items-center justify-center p-8">
                        <svg
                          className="animate-spin h-10 w-10 text-primary"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <p className="mt-4 text-gray-600">Đang tải mã QR...</p>
                      </div>
                    ) : qrCodeData?.data?.qrCodeUrl ? (
                      <div className="flex flex-col items-center">
                        <p className="mb-4 text-gray-700 font-medium">Quét mã QR để thanh toán:</p>
                        <div className="border-4 border-white p-1 rounded-lg shadow-lg mb-4">
                          <Image
                            src={qrCodeData.data.qrCodeUrl || "/placeholder.svg"}
                            alt="QR Code"
                            width={200}
                            height={200}
                            className="mx-auto"
                          />
                        </div>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                          Hệ thống sẽ tự động cập nhật khi nhận được thanh toán
                        </p>
                        {/* Hiển thị trạng thái thanh toán */}
                        {paymentStatus ? (
                          <div className="mt-4 flex items-center justify-center gap-2">
                            {paymentStatus === "PENDING" && (
                              <>
                                <svg
                                  className="animate-spin h-5 w-5 text-yellow-600"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                <span className="text-yellow-600">Đang chờ thanh toán...</span>
                              </>
                            )}
                            {paymentStatus === "PAID" && (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-green-600"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-green-600">Thanh toán thành công!</span>
                              </>
                            )}
                            {paymentStatus === "FAILED" && (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-red-600"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-red-600">Thanh toán thất bại!</span>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
                            <svg
                              className="animate-spin h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Đang Chờ Thanh Toán</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-red-500 p-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 mx-auto mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p>Không thể tạo mã QR</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="pt-4 border-t mt-6">
            <Button
              variant="outline"
              onClick={() => router.push("/pos")}
              className="w-full flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Quay lại POS
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}