"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table" // [^1]
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  CalendarIcon, 
  ArrowDownIcon, 
  ArrowUpIcon, 
  HistoryIcon, 
  Loader2, 
  User, 
  BanknoteIcon, 
  WalletIcon,
  ClipboardListIcon
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { 
  useStartCashRegisterMutation, 
  useEndCashRegisterMutation,
  useWithdrawCashRegisterMutation,
  useGetTodayCashRegisterQuery,
  useGetTransactionHistoryQuery
} from "@/features/cash-register/cashregisterApiSlice"
import { Transaction, TransactionHistory } from "@/features/cash-register/type"
import { toast } from "sonner"
import Link from "next/link"

export default function SafeManagementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [openingAmount, setOpeningAmount] = useState("")
  const [openingNotes, setOpeningNotes] = useState("")
  const [closingAmount, setClosingAmount] = useState("")
  const [closingNotes, setClosingNotes] = useState("")
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [withdrawalDescription, setWithdrawalDescription] = useState("")
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false)

  // Trạng thái cho lịch sử giao dịch
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 10

  const { 
    data: cashRegisterData, 
    isLoading: isLoadingCashRegister,
    refetch: refetchCashRegister
  } = useGetTodayCashRegisterQuery()

  const {
    data: transactionHistoryData,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactionHistory
  } = useGetTransactionHistoryQuery({
    startDate,
    endDate,
    page: currentPage,
    size: pageSize
  })

  const [startCashRegister, { isLoading: isStartingCashRegister }] = useStartCashRegisterMutation()
  const [endCashRegister, { isLoading: isEndingCashRegister }] = useEndCashRegisterMutation()
  const [withdrawCashRegister, { isLoading: isWithdrawing }] = useWithdrawCashRegisterMutation()

  const currentRegister = cashRegisterData?.data?.[0]
  const currentBalance = currentRegister?.currentAmount ?? 0
  const hasShiftStarted = Boolean(currentRegister?.shiftStart)
  const hasShiftEnded = Boolean(currentRegister?.shiftEnd)

  useEffect(() => {
    refetchCashRegister()
    refetchTransactionHistory()
  }, [refetchCashRegister, refetchTransactionHistory])

  const handleOpeningSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number.parseFloat(openingAmount)
    if (isNaN(amount)) return

    try {
      const response = await startCashRegister({
        amount: amount,
        notes: openingNotes || undefined
      })
      
      if (response.error) {
        const errorData = response.error as any
        toast.error(errorData.data?.message || "Không thể cập nhật số tiền đầu ngày")
        console.error("Failed to start cash register:", errorData)
        return
      }

      const data = response.data
      const newTransaction: Transaction = {
        id: transactions.length + 1,
        date: new Date(),
        type: "opening",
        amount: amount,
        balance: amount,
        description: openingNotes || undefined
      }

      setTransactions([...transactions, newTransaction])
      setOpeningAmount("")
      setOpeningNotes("")
      toast.success(data.message || "Đã cập nhật số tiền đầu ngày thành công", {
        description: `Số tiền ban đầu: ${formatCurrency(data.data?.[0]?.initialAmount || amount)}`
      })
      refetchCashRegister()
    } catch (error: any) {
      console.error("Failed to start cash register:", error)
      toast.error("Không thể cập nhật số tiền đầu ngày")
    }
  }

  const handleClosingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number.parseFloat(closingAmount)
    if (isNaN(amount)) return

    try {
      const response = await endCashRegister({
        amount: amount,
        notes: closingNotes || undefined
      })
      
      if (response.error) {
        const errorData = response.error as any
        toast.error(errorData.data?.message || "Không thể cập nhật số tiền cuối ngày", {
          description: `Số tiền nhập: ${formatCurrency(amount)}`
        })
        console.error("Failed to end cash register:", errorData)
        return
      }

      const data = response.data
      const newTransaction: Transaction = {
        id: transactions.length + 1,
        date: new Date(),
        type: "closing",
        amount: amount,
        balance: amount,
        description: closingNotes || undefined
      }

      setTransactions([...transactions, newTransaction])
      setClosingAmount("")
      setClosingNotes("")
      toast.success(data.message || "Đã cập nhật số tiền cuối ngày thành công", {
        description: `Số tiền cuối ca: ${formatCurrency(data.data?.[0]?.currentAmount || amount)}\nSố tiền ban đầu: ${formatCurrency(data.data?.[0]?.initialAmount || 0)}`
      })
      refetchCashRegister()
    } catch (error: any) {
      console.error("Failed to end cash register:", error)
      toast.error("Không thể cập nhật số tiền cuối ngày")
    }
  }

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number.parseFloat(withdrawalAmount)
    if (isNaN(amount)) return

    try {
      const response = await withdrawCashRegister({
        amount: amount,
        notes: withdrawalDescription
      })
      
      if (response.error) {
        const errorData = response.error as any
        toast.error(errorData.data?.message || "Không thể rút tiền", {
          description: `Số tiền muốn rút: ${formatCurrency(amount)}`
        })
        console.error("Failed to withdraw cash:", errorData)
        return
      }

      const data = response.data
      const lastTransaction = transactions[transactions.length - 1]
      const newBalance = lastTransaction ? lastTransaction.balance - amount : -amount

      const newTransaction: Transaction = {
        id: transactions.length + 1,
        date: new Date(),
        type: "withdrawal",
        amount: -amount,
        balance: newBalance,
        description: withdrawalDescription
      }

      setTransactions([...transactions, newTransaction])
      setWithdrawalAmount("")
      setWithdrawalDescription("")
      setIsWithdrawalDialogOpen(false)
      toast.success(data.message || "Đã rút tiền thành công", {
        description: `Số tiền rút: ${formatCurrency(amount)}\nSố dư hiện tại: ${formatCurrency(data.data?.[0]?.currentAmount || 0)}`
      })
      refetchCashRegister()
    } catch (error: any) {
      console.error("Failed to withdraw cash:", error)
      toast.error("Không thể rút tiền")
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
  }

  // Hàm xử lý chuyển trang
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  // Hàm xử lý thay đổi ngày
  const handleDateChange = () => {
    setCurrentPage(0)
    refetchTransactionHistory()
  }

  const formatTransferType = (type: string) => {
    switch (type) {
      case "CASH": return "Tiền mặt"
      case "BANKING": return "Chuyển khoản"
      default: return type
    }
  }

  const formatPaymentType = (type: string) => {
    return type === "IN" ? "Vào" : "Ra"
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản Lý Két</h1>
        <Link href="/cash-register/history">
          <Button variant="outline" className="flex items-center">
            <HistoryIcon className="mr-2 h-4 w-4" />
            Xem Lịch Sử Chi Tiết
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Tabs defaultValue="opening" className="col-span-2">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="opening" disabled={hasShiftStarted}>Đầu Ngày</TabsTrigger>
            <TabsTrigger value="closing" disabled={!hasShiftStarted || hasShiftEnded}>Cuối Ngày</TabsTrigger>
          </TabsList>
          <TabsContent value="opening">
            <Card>
              <CardHeader>
                <CardTitle>Nhập Số Tiền Đầu Ngày</CardTitle>
                <CardDescription>Nhập số tiền có trong két vào đầu ngày làm việc</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOpeningSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="opening-amount">Số tiền</Label>
                      <Input
                        id="opening-amount"
                        type="number"
                        placeholder="Nhập số tiền"
                        value={openingAmount}
                        onChange={(e) => setOpeningAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="opening-notes">Ghi chú</Label>
                      <Input
                        id="opening-notes"
                        placeholder="Nhập ghi chú (tùy chọn)"
                        value={openingNotes}
                        onChange={(e) => setOpeningNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                      <span className="text-sm text-muted-foreground">{format(new Date(), "dd/MM/yyyy")}</span>
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-4" disabled={isStartingCashRegister}>
                    {isStartingCashRegister ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Xác Nhận Số Tiền Đầu Ngày"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="closing">
            <Card>
              <CardHeader>
                <CardTitle>Nhập Số Tiền Cuối Ngày</CardTitle>
                <CardDescription>Nhập số tiền có trong két vào cuối ngày làm việc</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleClosingSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="closing-amount">Số tiền</Label>
                      <Input
                        id="closing-amount"
                        type="number"
                        placeholder="Nhập số tiền"
                        value={closingAmount}
                        onChange={(e) => setClosingAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="closing-notes">Ghi chú</Label>
                      <Input
                        id="closing-notes"
                        placeholder="Nhập ghi chú (tùy chọn)"
                        value={closingNotes}
                        onChange={(e) => setClosingNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                      <span className="text-sm text-muted-foreground">{format(new Date(), "dd/MM/yyyy")}</span>
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-4" disabled={isEndingCashRegister}>
                    {isEndingCashRegister ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Xác Nhận Số Tiền Cuối Ngày"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <WalletIcon className="mr-2 h-4 w-4" />
                Két Tiền Hiện Tại
              </CardTitle>
              <CardDescription>
                {isLoadingCashRegister ? (
                  "Đang tải..."
                ) : hasShiftStarted ? (
                  hasShiftEnded ? 
                    "Ca làm việc đã kết thúc" : 
                    "Thông tin két tiền hiện tại"
                ) : (
                  "Chưa bắt đầu ca làm việc"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCashRegister ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {formatCurrency(currentBalance)}
                  </div>
                  
                  {currentRegister && (
                    <div className="space-y-3 mt-3">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <User className="mr-2 h-4 w-4" />
                          <span>Người quản lý:</span>
                        </div>
                        <span className="font-medium">{currentRegister.userFullName}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <BanknoteIcon className="mr-2 h-4 w-4" />
                          <span>Số tiền ban đầu:</span>
                        </div>
                        <span className="font-medium">{formatCurrency(currentRegister.initialAmount)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Thời gian bắt đầu:</span>
                        </div>
                        <span className="font-medium">
                          {format(new Date(currentRegister.shiftStart), "HH:mm - dd/MM/yyyy")}
                        </span>
                      </div>
                      
                      {currentRegister.notes && (
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex items-center text-muted-foreground text-sm mb-1">
                            <ClipboardListIcon className="mr-2 h-4 w-4" />
                            <span>Ghi chú:</span>
                          </div>
                          <div className="text-sm bg-gray-50 p-2 rounded whitespace-pre-line">
                            {currentRegister.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    {hasShiftStarted && !hasShiftEnded && (
                      currentBalance > 0 ? (
                        <div className="flex items-center text-sm text-green-600 mb-2">
                          <ArrowUpIcon className="mr-1 h-4 w-4" />
                          Có sẵn để rút
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-red-600 mb-2">
                          <ArrowDownIcon className="mr-1 h-4 w-4" />
                          Két trống
                        </div>
                      )
                    )}

                    <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full" 
                          disabled={!hasShiftStarted || hasShiftEnded || currentBalance <= 0}
                        >
                          <ArrowUpIcon className="mr-2 h-4 w-4" />
                          Rút Tiền
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Rút Tiền Từ Két</DialogTitle>
                          <DialogDescription>
                            Số dư hiện tại: {formatCurrency(currentBalance)}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleWithdrawalSubmit}>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="withdrawal-amount">Số tiền</Label>
                              <Input
                                id="withdrawal-amount"
                                type="number"
                                placeholder="Nhập số tiền"
                                value={withdrawalAmount}
                                onChange={(e) => setWithdrawalAmount(e.target.value)}
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="withdrawal-description">Lý do</Label>
                              <Input
                                id="withdrawal-description"
                                placeholder="Nhập lý do rút tiền"
                                value={withdrawalDescription}
                                onChange={(e) => setWithdrawalDescription(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsWithdrawalDialogOpen(false)}>
                              Hủy
                            </Button>
                            <Button type="submit" disabled={isWithdrawing}>
                              {isWithdrawing ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Đang xử lý...
                                </>
                              ) : (
                                "Xác Nhận"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <HistoryIcon className="mr-2 h-5 w-5" />
              Lịch Sử Giao Dịch
            </CardTitle>
            <Link href="/cash-register/history" className="text-sm text-muted-foreground hover:text-primary">
              Xem tất cả
            </Link>
          </div>
          <CardDescription>Danh sách các giao dịch gần đây</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start-date">Từ ngày</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="end-date">Đến ngày</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleDateChange}>
                Lọc
              </Button>
            </div>
          </div>

          {isLoadingTransactions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời Gian</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Phương Thức</TableHead>
                    <TableHead>Số Tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionHistoryData?.data?.content.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Không có dữ liệu giao dịch
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactionHistoryData?.data?.content.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.transactionDate), "HH:mm - dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {transaction.paymentType === "IN" ? (
                              <span className="flex items-center text-green-500">
                                <ArrowDownIcon className="mr-1 h-4 w-4" />
                                {formatPaymentType(transaction.paymentType)}
                              </span>
                            ) : (
                              <span className="flex items-center text-red-500">
                                <ArrowUpIcon className="mr-1 h-4 w-4" />
                                {formatPaymentType(transaction.paymentType)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatTransferType(transaction.transferType)}</TableCell>
                        <TableCell
                          className={cn(
                            transaction.paymentType === "OUT" ? "text-red-500" : "text-green-500",
                            "font-medium",
                          )}
                        >
                          {transaction.paymentType === "OUT"
                            ? `- ${formatCurrency(transaction.amount)}`
                            : formatCurrency(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {transactionHistoryData?.data?.pagination && transactionHistoryData.data.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Trước
                  </Button>
                  <span className="text-sm">
                    Trang {currentPage + 1} / {transactionHistoryData.data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === transactionHistoryData.data.pagination.totalPages - 1}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
