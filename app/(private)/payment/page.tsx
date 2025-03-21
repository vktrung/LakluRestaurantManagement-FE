"use client"

import { useGetPaymentsQuery } from "@/features/payment/paymentApiSlice"
import { PaymentList } from "./components/PaymentList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, Loader2, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function PaymentManagementPage() {
  const { data, error, isLoading } = useGetPaymentsQuery()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const payments = data?.data || []

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Quản lý hóa đơn thanh toán</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="gap-2 self-start sm:self-auto hover:bg-primary/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại Dashboard</span>
        </Button>
      </div>

      <Card className="shadow-lg border-muted/60 overflow-hidden">
        <CardHeader className="border-b bg-muted/30 px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-md">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">Danh sách hóa đơn</CardTitle>
            </div>
            <div className="w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm hóa đơn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-[280px] pl-9 pr-4 h-10 bg-background/80 focus-visible:bg-background transition-colors"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px] bg-background/50">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4 opacity-80" />
                <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full bg-primary/10"></div>
              </div>
              <p className="text-muted-foreground font-medium">Đang tải dữ liệu hóa đơn...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="m-6 border-2 animate-in fade-in">
              <AlertTitle className="font-semibold flex items-center gap-2">
                <span className="bg-destructive/20 p-1 rounded-full">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 5V9M8 11.01L8.01 10.999M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Lỗi
              </AlertTitle>
              <AlertDescription className="mt-2">Không thể tải dữ liệu hóa đơn. Vui lòng thử lại sau.</AlertDescription>
            </Alert>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px] bg-background/50">
              <div className="bg-muted/50 p-4 rounded-full mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">Không có hóa đơn</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Chưa có hóa đơn nào được tạo hoặc không tìm thấy hóa đơn phù hợp với tìm kiếm của bạn.
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <PaymentList payments={payments} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

