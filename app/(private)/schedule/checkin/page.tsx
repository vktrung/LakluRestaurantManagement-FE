"use client"

import type React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useRef, useEffect, Suspense } from "react"
import { useCheckIn } from "@/app/(private)/schedule/components/useCheckIn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { motion } from "framer-motion"

// Client component để sử dụng useSearchParams
function CheckInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scheduleIdParam = searchParams.get('scheduleId')
  const expiryParam = searchParams.get('expiry')
  const signatureParam = searchParams.get('signature')

  console.log("URL Params:", { scheduleIdParam, expiryParam, signatureParam })

  const { handleCheckInFromQR } = useCheckIn()
  const [checkInStatus, setCheckInStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [hasCheckedIn, setHasCheckedIn] = useState(false)

  // References for PIN input fields
  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  // Handle PIN input
  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = password.split("")
      newPin[index] = value
      setPassword(newPin.join(""))

      // Move to next input if value is entered
      if (value && index < 3) {
        pinRefs[index + 1].current?.focus()
      }
    }
  }

  // Handle backspace in PIN input
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!password[index] && index > 0) {
        pinRefs[index - 1].current?.focus()
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      pinRefs[index - 1].current?.focus()
    } else if (e.key === "ArrowRight" && index < 3) {
      pinRefs[index + 1].current?.focus()
    }
  }

  // Update PIN input fields when password changes
  useEffect(() => {
    const pins = password.split("")
    pins.forEach((pin, index) => {
      if (pinRefs[index].current) {
        pinRefs[index].current!.value = pin
      }
    })
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (hasCheckedIn) return

    setCheckInStatus("loading")

    try {
      if (!scheduleIdParam || !expiryParam || !signatureParam) {
        throw new Error("Thông tin không hợp lệ!")
      }

      const scheduleIdNum = Number.parseInt(scheduleIdParam, 10) // Chuyển sang number
      const expiryNum = Number.parseInt(expiryParam, 10) // Chuyển sang number

      if (!username || password.length !== 4) {
        throw new Error("Vui lòng nhập username và mã PIN 4 số!")
      }

      console.log("Sending check-in request:", { 
        scheduleId: scheduleIdNum, 
        expiry: expiryNum, 
        signature: signatureParam, 
        username, 
        password 
      })
      
      const response = await handleCheckInFromQR(scheduleIdNum, expiryNum, signatureParam, username, password)
      setCheckInStatus("success")
      setErrorMessage(response.message || "Check-in thành công!")
      setHasCheckedIn(true)

      // Delay redirect for animation
      setTimeout(() => {
        router.push("/schedule")
      }, 1500)
    } catch (error: any) {
      setCheckInStatus("error")
      // Không đặt hasCheckedIn thành true để cho phép nhập lại
      console.error("Check-in error:", error)

      // Xử lý thông báo lỗi cụ thể
      if (error.status === 500 && error.data?.message === "Bad credentials") {
        setErrorMessage("Người dùng nhập sai username hoặc password")
      } else if (error.status === 400 && error.data?.error === "Yêu cầu không hợp lệ") {
        setErrorMessage("QR đã hết hiệu lực, vui lòng quét lại QR mới")
      } else {
        setErrorMessage(error.message || "Đã xảy ra lỗi khi check-in")
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 z-0"></div>

          {(checkInStatus === "idle" || (checkInStatus === "error" && !hasCheckedIn)) && (
            <form onSubmit={handleSubmit}>
              <CardHeader className="relative z-10 space-y-1 pb-6 pt-8">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Check-in
                </CardTitle>
                <CardDescription className="text-center">Nhập thông tin của bạn để check-in</CardDescription>
              </CardHeader>

              <CardContent className="relative z-10 space-y-6 px-6">
                <div className="space-y-3">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập username"
                      className="pl-10 h-11 rounded-md border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all"
                      required
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="pin" className="text-sm font-medium">
                    Mã PIN (4 số)
                  </Label>
                  <div className="flex justify-center gap-3">
                    {[0, 1, 2, 3].map((index) => (
                      <Input
                        key={index}
                        ref={pinRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        onChange={(e) => handlePinChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 text-center text-xl font-bold rounded-lg border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all"
                        required
                      />
                    ))}
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Nhập mã PIN 4 số của bạn</p>
                </div>

                {checkInStatus === "error" && errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center text-red-600 font-medium"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </CardContent>

              <CardFooter className="relative z-10 px-6 pb-8">
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Check-in
                </Button>
              </CardFooter>
            </form>
          )}

          {checkInStatus === "loading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 px-6 space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-75"></div>
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin relative z-10" />
              </div>
              <div className="text-center space-y-2">
                <CardTitle className="text-xl font-medium text-gray-800">Đang xử lý check-in...</CardTitle>
                <p className="text-muted-foreground">Vui lòng đợi trong giây lát.</p>
              </div>
            </motion.div>
          )}

          {checkInStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col items-center justify-center py-16 px-6 space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-full bg-green-100 animate-pulse"></div>
                <div className="relative z-10 h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="h-14 w-14 text-green-500" />
                </div>
              </motion.div>
              <div className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold text-green-600">Check-in thành công!</CardTitle>
                {errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center text-muted-foreground"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

// Fallback component khi đang loading
function CheckInLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-xl overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 px-6 space-y-6">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            </div>
            <div className="text-center">
              <CardTitle className="text-xl font-medium text-gray-800">Đang tải...</CardTitle>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Page component
export default function CheckInPage() {
  return (
    <Suspense fallback={<CheckInLoading />}>
      <CheckInForm />
    </Suspense>
  )
}