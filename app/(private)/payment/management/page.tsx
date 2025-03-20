"use client"

import { useGetPaymentsQuery } from "@/features/payment/paymentApiSlice"
import { PaymentList } from "../components/PaymentList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PaymentManagementPage() {
  const { data, error, isLoading } = useGetPaymentsQuery()
  const router = useRouter()

  const payments = data?.data || []

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý hóa đơn thanh toán</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Quay lại Dashboard
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader className="border-b bg-muted/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Danh sách hóa đơn</CardTitle>
            </div>
            <div className="w-full sm:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm hóa đơn..."
                  className="w-full sm:w-[250px] h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Đang tải dữ liệu hóa đơn...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="m-6">
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>Không thể tải dữ liệu hóa đơn. Vui lòng thử lại sau.</AlertDescription>
            </Alert>
          ) : (
            <PaymentList payments={payments} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

