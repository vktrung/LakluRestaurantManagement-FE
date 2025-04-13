"use client"

import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Loader2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { 
  useGetTablesByDateQuery,
  useTransferTablesMutation
} from "@/features/reservation/reservationApiSlice"
import { ReservationResponse, TableByDate } from "@/features/reservation/type"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface TransferTableDialogProps {
  reservation: ReservationResponse
  isOpen: boolean
  onClose: () => void
}

export function TransferTableDialog({ reservation, isOpen, onClose }: TransferTableDialogProps) {
  // Khởi tạo trạng thái
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fromTableIds, setFromTableIds] = useState<number[]>([])
  const [toTableIds, setToTableIds] = useState<number[]>([])

  // Lấy ngày đặt bàn từ reservation
  const reservationDate = useMemo(() => {
    if (!reservation?.detail?.checkIn) return format(new Date(), "yyyy-MM-dd")
    return reservation.detail.checkIn.split("T")[0] // Lấy phần ngày từ chuỗi ISO
  }, [reservation])

  // Lấy danh sách bàn từ API
  const {
    data: tablesData,
    isLoading: isLoadingTables,
    refetch: refetchTables
  } = useGetTablesByDateQuery(reservationDate)

  // Danh sách bàn khả dụng
  const availableTables = useMemo(() => tablesData?.data || [], [tablesData])

  // Sử dụng mutation hook chuyển bàn
  const [transferTables, { isLoading: isTransferring }] = useTransferTablesMutation()

  // Danh sách bàn hiện tại của đặt bàn
  const currentTableIds = useMemo(() => 
    reservation?.detail?.tables?.map(table => table.id) || [], 
    [reservation?.detail?.tables]
  )

  // Reset form khi dialog mở
  useEffect(() => {
    if (isOpen && reservation) {
      // Gọi lại API để lấy danh sách bàn mới nhất
      refetchTables()
      
      // Reset các state
      setFromTableIds([])
      setToTableIds([])
      setErrorMessage(null)
    }
  }, [isOpen, reservation, refetchTables])

  // Toggle bàn nguồn để chuyển
  const toggleFromTable = (tableId: number) => {
    setFromTableIds((prev) => (prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]))
  }

  // Toggle bàn đích để chuyển đến
  const toggleToTable = (tableId: number) => {
    setToTableIds((prev) => (prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]))
  }

  // Xử lý lỗi API
  const handleApiError = (error: any) => {
    console.error("Lỗi khi chuyển bàn:", error)
      
    // Xử lý hiển thị lỗi từ API
    if (error?.data?.error) {
      if (typeof error.data.error === 'object' && error.data.error !== null) {
        const errorEntries = Object.entries(error.data.error)
        if (errorEntries.length > 0) {
          setErrorMessage(String(errorEntries[0][1]))
        } else {
          setErrorMessage("Không thể chuyển bàn. Vui lòng thử lại.")
        }
      } else {
        setErrorMessage(String(error.data.error))
      }
    } else if (error?.data?.message) {
      setErrorMessage(error.data.message)
    } else {
      setErrorMessage("Đã xảy ra lỗi khi chuyển bàn. Vui lòng thử lại sau.")
    }
  }

  // Xử lý chuyển bàn
  const handleTransferTables = async () => {
    if (fromTableIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một bàn nguồn")
      return
    }

    if (toTableIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một bàn đích")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null) // Reset lỗi cũ

    try {
      await transferTables({
        reservationId: reservation.id,
        request: {
          fromTableIds,
          toTableIds
        }
      }).unwrap()

      toast.success("Đã chuyển bàn thành công")
      onClose()
    } catch (error: any) {
      handleApiError(error)
      toast.error("Chuyển bàn thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Chuyển bàn cho đặt bàn #{reservation.id}</DialogTitle>
          <DialogDescription>
            Chọn bàn nguồn (bàn hiện tại) cần chuyển và bàn đích (bàn mới) để chuyển đến
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Phần bàn nguồn (bàn để chuyển đi) */}
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-4">Chọn bàn nguồn (bàn cần chuyển đi)</h3>
            
            {isLoadingTables ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Đang tải danh sách bàn...</p>
              </div>
            ) : !currentTableIds || currentTableIds.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Đặt bàn hiện tại không có bàn nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto p-2">
                {availableTables
                  .filter(table => currentTableIds.includes(table.id))
                  .map((table) => {
                    const isSelected = fromTableIds.includes(table.id)
                    
                    return (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => toggleFromTable(table.id)}
                        className={cn(
                          "border rounded-md p-3 text-center transition-all",
                          "bg-orange-100 border-orange-300 hover:bg-orange-200",
                          isSelected && "bg-blue-100 border-blue-300 ring-2 ring-blue-400",
                        )}
                      >
                        <div className="font-medium">{table.tableNumber}</div>
                        <div className="text-xs text-muted-foreground">Sức chứa: {table.capacity} người</div>
                        <div className="text-xs mt-1">
                          <span className="text-orange-600">Bàn hiện tại</span>
                        </div>
                      </button>
                    )
                  })}
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm">
                Bàn nguồn đã chọn:{" "}
                {fromTableIds.length
                  ? fromTableIds
                      .map((id) => {
                        const table = availableTables.find(t => t.id === id)
                        return table ? table.tableNumber : `Bàn ${id}`
                      })
                      .join(", ")
                  : "Chưa chọn bàn"}
              </p>
            </div>
          </div>

          {/* Phần bàn đích (bàn để chuyển đến) */}
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-4">Chọn bàn đích (bàn cần chuyển đến)</h3>
            
            {isLoadingTables ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Đang tải danh sách bàn...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto p-2">
                {availableTables
                  .filter(table => table.status === "AVAILABLE" && !currentTableIds.includes(table.id))
                  .map((table) => {
                    const isSelected = toTableIds.includes(table.id)

                    return (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => toggleToTable(table.id)}
                        className={cn(
                          "border rounded-md p-3 text-center transition-all",
                          "bg-green-100 border-green-300 hover:bg-green-200",
                          isSelected && "bg-blue-100 border-blue-300 ring-2 ring-blue-400",
                        )}
                      >
                        <div className="font-medium">{table.tableNumber}</div>
                        <div className="text-xs text-muted-foreground">Sức chứa: {table.capacity} người</div>
                        <div className="text-xs mt-1">
                          <span className="text-green-600">Khả dụng</span>
                        </div>
                      </button>
                    )
                  })}
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm">
                Bàn đích đã chọn:{" "}
                {toTableIds.length
                  ? toTableIds
                      .map((id) => {
                        const table = availableTables.find(t => t.id === id)
                        return table ? table.tableNumber : `Bàn ${id}`
                      })
                      .join(", ")
                  : "Chưa chọn bàn"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <ArrowRight className="h-5 w-5 mx-2 text-blue-500" />
            <span>Chuyển từ <b>{fromTableIds.length}</b> bàn sang <b>{toTableIds.length}</b> bàn</span>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleTransferTables}
            disabled={isSubmitting || isTransferring || fromTableIds.length === 0 || toTableIds.length === 0}
          >
            {(isSubmitting || isTransferring) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang chuyển...
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Chuyển bàn
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 