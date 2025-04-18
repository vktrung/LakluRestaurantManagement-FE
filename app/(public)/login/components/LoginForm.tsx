"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/services/authService"

export default function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtp, setShowOtp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4)
    setOtp(value)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!username) {
      setErrorMessage("Vui lòng nhập tên đăng nhập")
      return
    }

    if (!otp) {
      setErrorMessage("Vui lòng nhập mã OTP")
      return
    }

    setIsLoading(true)

    try {
      const response = await login(username, otp)
      console.log("response", response)
      router.push("/")
      router.refresh()
    } catch (err: any) {
      setErrorMessage(err?.data?.message || "Đăng nhập thất bại!")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left column with logo */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-white">
        <div className="px-8">
          <Image
            src="/Logo-09.png"
            alt="Taktu Logo"
            width={400}
            height={150}
            priority
            className="h-auto"
            style={{ width: "auto", height: "auto" }}
          />
        </div>
      </div>

      {/* Right column with form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex md:hidden justify-center mb-8">
            <Image
              src="/Logo-09.png"
              alt="Taktu Logo"
              width={280}
              height={100}
              priority
              className="h-auto"
              style={{ width: "auto", height: "auto" }}
            />
          </div>

          <div className="border border-gray-100 rounded-lg p-8 shadow-sm">
            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-semibold text-center">Đăng nhập</h1>
              <p className="text-gray-500 text-sm text-center">
                Nhập thông tin đăng nhập để truy cập tài khoản của bạn
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
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
                  <Input
                    id="username"
                    placeholder="Nhập tên đăng nhập"
                    className="pl-10 border-gray-200"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium">
                  Mã OTP
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <Input
                    id="otp"
                    type={showOtp ? "text" : "password"}
                    placeholder="Nhập mã OTP 4 chữ số"
                    className="pl-10 pr-10 border-gray-200"
                    value={otp}
                    onChange={handleOtpChange}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowOtp(!showOtp)}
                  >
                    {showOtp ? <EyeOff size={20} /> : <Eye size={20} />}
                    <span className="sr-only">{showOtp ? "Ẩn OTP" : "Hiện OTP"}</span>
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="text-sm font-medium text-red-500 text-center">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-black hover:bg-black/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Đang xác thực..." : "Xác thực"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}