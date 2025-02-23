"use client"

import React, { useState } from "react"

// RTK Query (giả sử bạn có sẵn hook này)

// shadcn/ui
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// Giả sử đây là các component OTP của bạn
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useLoginMutation } from "@/features/auth/authApiSlice"
import { parseDuration } from "@/utils/dateTime"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  // State
  const [username, setUsername] = useState("")
  const [otp, setOtp] = useState("") // Lưu giá trị OTP (4 ký tự)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  // RTK Query
  const [login, { isLoading }] = useLoginMutation()

  /**
   * Khi user bấm "Tiếp tục" sau khi nhập username
   */
  const handleCheckUsername = () => {
    if (!username) {
      setErrorMessage("Vui lòng nhập username")
      return
    }
    setErrorMessage("")
    setShowOtpModal(true) // Mở dialog để nhập OTP
  }

  /**
   * Khi bấm "Xác thực" => Gọi login
   */
  const handleLogin = async () => {
    setErrorMessage("")
    if (!otp) {
      setErrorMessage("Vui lòng nhập mã OTP")
      return
    }

    try {
      const response = await login({ username, password: otp }).unwrap()
      console.log('response', response)
      // Giả sử server trả về { token }
      document.cookie = `auth-token=${response.data.token}; path=/; max-age=${parseDuration('1h')};`
      router.push('/')
    } catch (err: any) {
      setErrorMessage(err?.data?.message || "Đăng nhập thất bại!")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Form nhập username */}
      <div className="w-full max-w-sm bg-white p-6 shadow rounded-md space-y-4">
        <h1 className="text-xl font-bold">Login</h1>

        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <Input
            type="text"
            placeholder="Nhập username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <Button onClick={handleCheckUsername}>Tiếp tục</Button>

        {errorMessage && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}
      </div>

      {/* Modal nhập OTP */}
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập OTP</DialogTitle>
            <DialogDescription>Vui lòng nhập 4 ký tự OTP</DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <InputOTP maxLength={4} pattern="[0-9]*" onChange={(val: string) => setOtp(val)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
          )}

          <DialogFooter>
            <Button onClick={handleLogin} disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Xác thực"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
