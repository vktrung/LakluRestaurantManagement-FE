"use client"

import { useState, useEffect } from "react"
import {
  Receipt,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Percent,
  QrCode,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useProcessCashPaymentMutation,
  useGenerateQrCodeQuery,
} from '@/features/payment/paymentApiSlice';
import { PaymentRequest } from '@/features/payment/types';

type CheckoutStep = "details" | "cash-payment" | "transfer-payment"

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash")
  const [vatRate, setVatRate] = useState("10.00")
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("details")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [currentPaymentId, setCurrentPaymentId] = useState<number | null>(null)

  // Giả sử đây là dữ liệu từ order (có thể truyền qua props)
  const orderId = 1; // Thay bằng dữ liệu thực tế từ order
  const subtotal = 169.97; // Thay bằng dữ liệu thực tế từ order

  // Tính toán tổng tiền
  const vatPercentage = Number.parseFloat(vatRate) || 0
  const vatAmount = (subtotal * vatPercentage) / 100
  const total = subtotal + vatAmount

  // API hooks
  const { data: paymentsData, refetch } = useGetPaymentsQuery(undefined, { pollingInterval: 5000 })
  const [createPayment] = useCreatePaymentMutation()

  // Clear messages after 3 seconds
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("")
        setSuccessMessage("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage, successMessage])

  const handleCheckout = async () => {
    setIsLoading(true)

    const paymentRequest: PaymentRequest = {
      orderId,
      paymentMethod: paymentMethod === "cash" ? "CASH" : "TRANSFER",
      vat: vatAmount,
    }

    try {
      const response = await createPayment(paymentRequest).unwrap()
      const newPayment = response.data
      setCurrentPaymentId(newPayment.paymentId)

      setSuccessMessage(`Redirecting to ${paymentMethod} payment...`)
      if (paymentMethod === "cash") {
        setCheckoutStep("cash-payment")
      } else {
        setCheckoutStep("transfer-payment")
      }
    } catch (error) {
      setErrorMessage("Failed to create payment")
    } finally {
      setIsLoading(false)
    }
  }

  // Format VAT rate
  useEffect(() => {
    if (vatRate !== "" && !isNaN(Number.parseFloat(vatRate))) {
      setVatRate(Number.parseFloat(vatRate).toFixed(2))
    }
  }, [vatRate])

  const handleBackToDetails = () => {
    setCheckoutStep("details")
    setCurrentPaymentId(null)
  }

  const renderCheckoutStep = () => {
    switch (checkoutStep) {
      case "cash-payment":
        return (
          <CashPaymentScreen
            total={total}
            orderId="ORD-T7AHQwGH7"
            onBack={handleBackToDetails}
            paymentId={currentPaymentId}
          />
        )
      case "transfer-payment":
        return (
          <TransferPaymentScreen
            total={total}
            orderId="ORD-T7AHQwGH7"
            onBack={handleBackToDetails}
            paymentId={currentPaymentId}
          />
        )
      default:
        return (
          <>
            <CardHeader className="border-b pb-4 bg-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Payment</CardTitle>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground text-xs">Order ID</span>
                  <div className="font-medium text-foreground bg-gray-100 px-2 py-1 rounded-md text-xs">
                    ORD-T7AHQwGH7
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6 bg-white">
              {(errorMessage || successMessage) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-md ${errorMessage ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`}
                >
                  {errorMessage || successMessage}
                </motion.div>
              )}

              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <span className="bg-primary/10 p-1 rounded-full mr-2">
                    <Banknote className="h-3.5 w-3.5 text-primary" />
                  </span>
                  Payment Method
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    className={`border rounded-md overflow-hidden ${paymentMethod === "cash" ? "ring-2 ring-primary ring-offset-2" : "hover:border-gray-300"}`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div
                      className={`flex items-center gap-2 cursor-pointer p-3 ${paymentMethod === "cash" ? "bg-primary/5" : ""}`}
                      onClick={() => setPaymentMethod("cash")}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "cash" ? "border-primary bg-primary" : "border-muted-foreground"}`}
                      >
                        {paymentMethod === "cash" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <Banknote className="h-4 w-4 text-primary" />
                      <span className="font-medium">Cash</span>
                    </div>
                  </motion.div>
                  <motion.div
                    className={`border rounded-md overflow-hidden ${paymentMethod === "transfer" ? "ring-2 ring-primary ring-offset-2" : "hover:border-gray-300"}`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div
                      className={`flex items-center gap-2 cursor-pointer p-3 ${paymentMethod === "transfer" ? "bg-primary/5" : ""}`}
                      onClick={() => setPaymentMethod("transfer")}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "transfer" ? "border-primary bg-primary" : "border-muted-foreground"}`}
                      >
                        {paymentMethod === "transfer" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span className="font-medium">Transfer</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="vat" className="flex items-center gap-1 mb-2 text-sm">
                    <Percent className="h-3.5 w-3.5 text-primary" />
                    VAT Rate (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="vat"
                      value={vatRate}
                      onChange={(e) => setVatRate(e.target.value)}
                      className="text-right pr-6 focus-visible:ring-primary"
                      onFocus={(e) => e.target.select()}
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                  {vatPercentage > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">VAT amount: ${vatAmount.toFixed(2)}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2 rounded-lg bg-gray-50 p-4">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Receipt className="h-3.5 w-3.5 text-primary mr-1" />
                  Order Summary
                </h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT ({vatPercentage}%)</span>
                  <span className="font-medium">${vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t border-dashed border-gray-200 mt-2">
                  <span className="text-lg">Total</span>
                  <span className="text-lg text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-6 bg-white">
              <Button
                className="w-full h-12 text-base font-medium shadow-md"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {paymentMethod === "cash" ? <Banknote className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
                    Checkout with {paymentMethod === "cash" ? "Cash" : "Transfer"}
                  </div>
                )}
              </Button>
            </CardFooter>
          </>
        )
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          {renderCheckoutStep()}
        </Card>
      </motion.div>
    </div>
  )
}

function CashPaymentScreen({
  total,
  orderId,
  onBack,
  paymentId,
}: {
  total: number
  orderId: string
  onBack: () => void
  paymentId: number | null
}) {
  const [cashReceived, setCashReceived] = useState("")
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [processCashPayment] = useProcessCashPaymentMutation()

  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("")
        setSuccessMessage("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage, successMessage])

  const handleComplete = async () => {
    if (!cashReceived || Number.parseFloat(cashReceived) < total) {
      setErrorMessage("Please enter an amount equal to or greater than the total")
      return
    }

    if (!paymentId) {
      setErrorMessage("Payment ID is missing")
      return
    }

    setIsCompleting(true)
    try {
      const response = await processCashPayment({
        paymentId,
        receivedAmount: Number.parseFloat(cashReceived),
      }).unwrap()
      setIsCompleted(true)
      setSuccessMessage(`Payment of $${total.toFixed(2)} has been processed.`)
    } catch (error) {
      setErrorMessage("Failed to process cash payment")
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <>
      <CardHeader className="border-b pb-4 bg-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Banknote className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Cash Payment</CardTitle>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground text-xs">Order ID</span>
            <div className="font-medium text-foreground bg-gray-100 px-2 py-1 rounded-md text-xs">{orderId}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6 bg-white">
        {(errorMessage || successMessage) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-3 rounded-md ${errorMessage ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`}
          >
            {errorMessage || successMessage}
          </motion.div>
        )}

        {isCompleted ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Payment Complete!</h3>
            <p className="text-muted-foreground">Payment of ${total.toFixed(2)} has been received.</p>
            {Number.parseFloat(cashReceived) > total && (
              <div className="bg-gray-100 p-3 rounded-md inline-block">
                <p className="text-sm font-medium">Change: ${(Number.parseFloat(cashReceived) - total).toFixed(2)}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div>
              <Label htmlFor="cashReceived" className="text-sm mb-2 block flex items-center">
                <Banknote className="h-3.5 w-3.5 text-primary mr-1" />
                Cash Received
              </Label>
              <div className="relative">
                <Input
                  id="cashReceived"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="Enter amount received"
                  className="focus-visible:ring-primary pr-6"
                  type="number"
                  min={total}
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              </div>
              {cashReceived && Number.parseFloat(cashReceived) > total && (
                <p className="text-xs text-muted-foreground mt-1">
                  Change: ${(Number.parseFloat(cashReceived) - total).toFixed(2)}
                </p>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Due:</span>
                <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="pt-0 pb-6 bg-white space-x-3">
        {isCompleted ? (
          <Button className="w-full h-12 text-base font-medium" variant="outline" onClick={onBack}>
            Return to Checkout
          </Button>
        ) : (
          <>
            <Button variant="outline" className="flex-1" onClick={onBack}>
              Back
            </Button>
            <Button
              className="flex-1 h-12 text-base font-medium shadow-md"
              onClick={handleComplete}
              disabled={isCompleting || !cashReceived || Number.parseFloat(cashReceived) < total}
            >
              {isCompleting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Payment
                </div>
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </>
  )
}

function TransferPaymentScreen({
  total,
  orderId,
  onBack,
  paymentId,
}: {
  total: number
  orderId: string
  onBack: () => void
  paymentId: number | null
}) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  const { data: qrData } = useGenerateQrCodeQuery(paymentId || 0, { skip: !paymentId })
  const { data: paymentsData } = useGetPaymentsQuery(undefined, { pollingInterval: 5000 })

  useEffect(() => {
    if (qrData) {
      setQrCodeUrl(qrData.data.qrCodeUrl)
    }
  }, [qrData])

  useEffect(() => {
    if (paymentId && paymentsData) {
      const payment = paymentsData.data.find((p) => p.paymentId === paymentId)
      if (payment && payment.paymentStatus === "PAID") {
        setIsCompleted(true)
        setSuccessMessage(`Transfer of $${total.toFixed(2)} has been verified.`)
      }
    }
  }, [paymentsData, paymentId, total])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleVerify = () => {
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
    }, 2000)
  }

  return (
    <>
      <CardHeader className="border-b pb-4 bg-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Transfer Payment</CardTitle>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground text-xs">Order ID</span>
            <div className="font-medium text-foreground bg-gray-100 px-2 py-1 rounded-md text-xs">{orderId}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6 bg-white">
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-md bg-green-50 text-green-600 border border-green-200"
          >
            {successMessage}
          </motion.div>
        )}

        {isCompleted ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Payment Complete!</h3>
            <p className="text-muted-foreground">Transfer of ${total.toFixed(2)} has been verified.</p>
            <p className="text-xs text-muted-foreground">A receipt has been sent to your email.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="bg-white p-2 rounded">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
                  ) : (
                    <div className="w-48 h-48 mx-auto bg-gray-50 flex items-center justify-center border">
                      <QrCode className="w-32 h-32 text-primary" />
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium">Scan to pay ${total.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Or transfer to account number:</p>
                <p className="font-mono bg-gray-100 px-3 py-1 rounded text-sm">1234-5678-9012-3456</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Due:</span>
                <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Please complete the transfer and click "Verify Payment" below.
              </p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="pt-0 pb-6 bg-white space-x-3">
        {isCompleted ? (
          <Button className="w-full h-12 text-base font-medium" variant="outline" onClick={onBack}>
            Return to Checkout
          </Button>
        ) : (
          <>
            <Button variant="outline" className="flex-1" onClick={onBack}>
              Back
            </Button>
            <Button
              className="flex-1 h-12 text-base font-medium shadow-md"
              onClick={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Verify Payment
                </div>
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </>
  )
}