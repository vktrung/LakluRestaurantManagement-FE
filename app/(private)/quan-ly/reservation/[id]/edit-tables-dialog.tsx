"use client"

import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Loader2, Plus, Minus } from "lucide-react"

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
  useMergeOrSplitTablesMutation,
  useRemoveTablesFromReservationMutation,
  useAddTablesToReservationMutation 
} from "@/features/reservation/reservationApiSlice"
import { ReservationResponse, TableByDate } from "@/features/reservation/type"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EditTablesDialogProps {
  reservation: ReservationResponse
  isOpen: boolean
  onClose: () => void
}

export function EditTablesDialog({ reservation, isOpen, onClose }: EditTablesDialogProps) {
  // Lazy initialization cho selectedTables để tránh error
  const [selectedTables, setSelectedTables] = useState<number[]>([])
  const [tablesToAdd, setTablesToAdd] = useState<number[]>([])
  const [tablesToRemove, setTablesToRemove] = useState<number[]>([])
  const [numberOfPeople, setNumberOfPeople] = useState<number>(6)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("remove")

  // Lấy ngày hiện tại của reservation bằng useMemo để tránh tính toán lại
  const formattedDate = useMemo(() => {
    if (!reservation?.detail?.checkIn) return format(new Date(), "yyyy-MM-dd");
    
    try {
      const checkInDate = new Date(reservation.detail.checkIn);
      // Đảm bảo rằng ngày là hợp lệ
      if (isNaN(checkInDate.getTime())) {
        console.error('Ngày check-in không hợp lệ:', reservation.detail.checkIn);
        return format(new Date(), "yyyy-MM-dd");
      }
      
      // Định dạng ngày theo yyyy-MM-dd
      const formattedDate = format(checkInDate, "yyyy-MM-dd");
      console.log('Ngày đã được định dạng:', formattedDate);
      return formattedDate;
    } catch (error) {
      console.error('Lỗi khi định dạng ngày:', error);
      return format(new Date(), "yyyy-MM-dd");
    }
  }, [reservation?.detail?.checkIn]);
  
  // Fetch available tables for the selected date
  const { data: tablesByDateResponse, isLoading: isLoadingTables } = useGetTablesByDateQuery(
    formattedDate,
    { skip: !formattedDate }
  )
  
  // Debug tablesByDateResponse
  useEffect(() => {
    if (tablesByDateResponse) {
      console.log('debug API response tablesByDate:', tablesByDateResponse);
    }
  }, [tablesByDateResponse]);
  
  // Get available tables from the API response, sử dụng useMemo để tránh tính toán lại
  const availableTables = useMemo(() => tablesByDateResponse?.data || [], [tablesByDateResponse])
  
  // Mutations
  const [mergeOrSplitTables, { isLoading: isMerging }] = useMergeOrSplitTablesMutation()
  const [removeTablesFromReservation, { isLoading: isRemoving }] = useRemoveTablesFromReservationMutation()
  const [addTablesToReservation, { isLoading: isAdding }] = useAddTablesToReservationMutation()
  
  // Debug useEffect để theo dõi dữ liệu
  useEffect(() => {
    if (isOpen) {
      console.log('debug currentTableIds:', reservation?.detail?.tableIds);
      console.log('debug availableTables:', availableTables);
      console.log('debug tableCount:', reservation?.detail?.tableIds?.length || 0);
      console.log('debug formattedDate:', formattedDate);
    }
  }, [isOpen, availableTables, reservation?.detail?.tableIds, formattedDate]);
  
  // Đặt lại bàn đã chọn và số người khi dialog mở
  useEffect(() => {
    if (isOpen && reservation) {
      // Nếu đã có bàn được đặt, hiển thị chúng
      const currentTableIds = reservation.detail.tableIds || []
      setSelectedTables(currentTableIds)
      setTablesToAdd([])
      setTablesToRemove([])
      // Đặt lại số người
      setNumberOfPeople(reservation.detail.numberOfPeople || 6)
      // Reset lỗi
      setErrorMessage(null)
    }
    
    // Cleanup function khi dialog đóng
    return () => {
      if (!isOpen) {
        setSelectedTables([])
        setTablesToAdd([])
        setTablesToRemove([])
        setErrorMessage(null)
      }
    }
  }, [isOpen, reservation])

  // Lấy danh sách bàn hiện đang được sử dụng cho đặt bàn này
  const currentTableIds = useMemo(() => 
    reservation?.detail?.tables?.map(table => table.id) || [], 
    [reservation?.detail?.tables]
  )

  // Thêm debug log sau khi đã khai báo currentTableIds
  useEffect(() => {
    if (isOpen && currentTableIds) {
      console.log('debug matchedTablesCount:', availableTables.filter(table => currentTableIds.includes(table.id)).length);
    }
  }, [isOpen, availableTables, currentTableIds]);

  // Toggle bàn trong chế độ cập nhật 
  const toggleTableSelection = (tableId: number) => {
    setSelectedTables((prev) => (prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]))
  }

  // Toggle bàn trong chế độ thêm
  const toggleTableToAdd = (tableId: number) => {
    setTablesToAdd((prev) => (prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]))
  }

  // Toggle bàn trong chế độ xóa
  const toggleTableToRemove = (tableId: number) => {
    setTablesToRemove((prev) => (prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]))
  }

  const getTableStatusClass = (isAvailable: boolean, isCurrentTable: boolean) => {
    if (isCurrentTable) {
      return "bg-orange-100 border-orange-300 hover:bg-orange-200"
    }
    return isAvailable 
      ? "bg-green-100 border-green-300 hover:bg-green-200"
      : "bg-red-100 border-red-300 cursor-not-allowed opacity-70"
  }

  // Xử lý thay đổi số người
  const handleNumberOfPeopleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setNumberOfPeople(isNaN(value) ? 1 : Math.max(1, value))
  }

  // Xử lý lỗi API
  const handleApiError = (error: any) => {
    console.error("Lỗi khi cập nhật bàn:", error)
      
    // Xử lý hiển thị lỗi từ API
    if (error?.data?.error) {
      // Kiểm tra nếu error.data.error là đối tượng
      if (typeof error.data.error === 'object' && error.data.error !== null) {
        // Tìm kiếm thông báo lỗi từ các thuộc tính của object
        const errorEntries = Object.entries(error.data.error);
        if (errorEntries.length > 0) {
          // Lấy giá trị đầu tiên từ đối tượng lỗi
          setErrorMessage(String(errorEntries[0][1]));
        } else {
          setErrorMessage("Không thể cập nhật bàn. Vui lòng thử lại.");
        }
      } else {
        // Nếu không phải đối tượng, gán trực tiếp
        setErrorMessage(String(error.data.error));
      }
    } else if (typeof error?.data === 'object' && error.data !== null) {
      // Tìm thông báo lỗi trong các trường khác
      const errorFields = Object.entries(error.data).find(([key, value]) => 
        key !== 'timestamp' && key !== 'httpStatus' && value !== null
      )
      
      if (errorFields) {
        // Đảm bảo errorMessage là một chuỗi
        const errorValue = errorFields[1];
        if (typeof errorValue === 'string') {
          setErrorMessage(errorValue);
        } else if (errorValue && typeof errorValue === 'object') {
          // Nếu là object, lấy giá trị đầu tiên từ object
          const nestedErrorEntries = Object.entries(errorValue);
          if (nestedErrorEntries.length > 0) {
            setErrorMessage(String(nestedErrorEntries[0][1]));
          } else {
            setErrorMessage(JSON.stringify(errorValue));
          }
        } else {
          setErrorMessage("Không thể cập nhật bàn. Vui lòng thử lại.");
        }
      } else {
        setErrorMessage("Không thể cập nhật bàn. Vui lòng thử lại.")
      }
    } else {
      setErrorMessage("Không thể cập nhật bàn. Vui lòng thử lại.")
    }
  }

  // Xử lý cập nhật bàn (PUT)
  const handleUpdateTables = async () => {
    if (selectedTables.length === 0) {
      toast.error("Vui lòng chọn ít nhất một bàn")
      return
    }

    if (numberOfPeople < 1) {
      toast.error("Số người phải lớn hơn 0")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null) // Reset lỗi cũ

    try {
      await mergeOrSplitTables({
        reservationId: reservation.id,
        tableIds: selectedTables,
        numberOfPeople: numberOfPeople
      }).unwrap()

      toast.success("Đã cập nhật bàn thành công")
      onClose()
    } catch (error: any) {
      handleApiError(error)
      toast.error("Cập nhật bàn thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Xử lý thêm bàn (POST)
  const handleAddTables = async () => {
    if (tablesToAdd.length === 0) {
      toast.error("Vui lòng chọn ít nhất một bàn để thêm")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null) // Reset lỗi cũ

    try {
      await addTablesToReservation({
        reservationId: reservation.id,
        request: { tableIds: tablesToAdd }
      }).unwrap()

      toast.success("Đã thêm bàn thành công")
      onClose()
    } catch (error: any) {
      handleApiError(error)
      toast.error("Thêm bàn thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Xử lý xóa bàn (DELETE)
  const handleRemoveTables = async () => {
    if (tablesToRemove.length === 0) {
      toast.error("Vui lòng chọn ít nhất một bàn để xóa")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null) // Reset lỗi cũ

    try {
      await removeTablesFromReservation({
        reservationId: reservation.id,
        request: { tableIds: tablesToRemove }
      }).unwrap()

      toast.success("Đã xóa bàn thành công")
      onClose()
    } catch (error: any) {
      handleApiError(error)
      toast.error("Xóa bàn thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px]" forceMount>
        <DialogHeader>
          <DialogTitle>Quản lý bàn cho đặt bàn #{reservation?.id}</DialogTitle>
          <DialogDescription>
            Thêm hoặc xóa bàn cho đặt bàn
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>
                {typeof errorMessage === 'string' 
                  ? errorMessage 
                  : typeof errorMessage === 'object'
                    ? JSON.stringify(errorMessage)
                    : "Đã xảy ra lỗi không xác định"}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="remove" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="remove">Xóa bàn</TabsTrigger>
              <TabsTrigger value="add">Thêm bàn</TabsTrigger>
            </TabsList>

            {/* Tab xóa bàn */}
            <TabsContent value="remove">
              <div className="space-y-4">
                <div className="flex space-x-2 mb-2">
                  <Badge variant="outline" className="bg-orange-100 border-orange-300">
                    Bàn hiện tại
                  </Badge>
                  <Badge variant="outline" className="bg-red-100 border-red-300">
                    Đã chọn để xóa
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Chọn bàn để xóa khỏi đặt bàn này. Chỉ có thể xóa các bàn đã được đặt.
                </p>

                {!currentTableIds || currentTableIds.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">Đặt bàn hiện tại không có bàn nào</p>
                  </div>
                ) : isLoadingTables ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Đang tải danh sách bàn...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-[400px] overflow-y-auto p-2">
                    {/* Sử dụng thông tin bàn từ API mới */}
                    {reservation.detail.tables && 
                      reservation.detail.tables.map((table) => {
                        const isSelected = tablesToRemove.includes(table.id);
                        
                        return (
                          <button
                            key={table.id}
                            type="button"
                            onClick={() => toggleTableToRemove(table.id)}
                            className={cn(
                              "border rounded-md p-3 text-center transition-all",
                              "bg-orange-100 border-orange-300 hover:bg-orange-200",
                              isSelected && "bg-red-100 border-red-300 ring-2 ring-red-400",
                            )}
                          >
                            <div className="font-medium">{table.tableNumber}</div>
                            <div className="text-xs mt-1">
                              <span className="text-orange-600">Bàn hiện tại</span>
                            </div>
                          </button>
                        );
                      })
                    }
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-sm">
                    Bàn để xóa:{" "}
                    {tablesToRemove.length
                      ? tablesToRemove
                          .map((id) => {
                            // Tìm bàn trong danh sách tables
                            const table = reservation.detail.tables?.find(t => t.id === id);
                            return table ? table.tableNumber : `Bàn ${id}`;
                          })
                          .join(", ")
                      : "Chưa chọn bàn"}
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={onClose}>
                    Hủy
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleRemoveTables}
                    disabled={isSubmitting || isRemoving || tablesToRemove.length === 0}
                  >
                    {(isSubmitting || isRemoving) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <Minus className="mr-2 h-4 w-4" />
                        Xóa bàn
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tab thêm bàn */}
            <TabsContent value="add">
              <div className="space-y-4">
                <div className="flex space-x-2 mb-2">
                  <Badge variant="outline" className="bg-green-100 border-green-300">
                    Khả dụng
                  </Badge>
                  <Badge variant="outline" className="bg-red-100 border-red-300">
                    Không khả dụng
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 border-blue-300">
                    Đã chọn để thêm
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Chọn bàn để thêm vào đặt bàn này. Chỉ có thể chọn các bàn khả dụng.
                </p>

                {isLoadingTables ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Đang tải danh sách bàn...</p>
                  </div>
                ) : availableTables.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">Không có bàn khả dụng</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-[400px] overflow-y-auto p-2">
                    {availableTables.filter(table => table.status === "AVAILABLE").map((table) => {
                      const isSelected = tablesToAdd.includes(table.id)

                      return (
                        <button
                          key={table.id}
                          type="button"
                          onClick={() => toggleTableToAdd(table.id)}
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
                    Bàn để thêm:{" "}
                    {tablesToAdd.length
                      ? tablesToAdd
                          .map((id) => {
                            const table = availableTables.find((t) => t.id === id)
                            return table?.tableNumber
                          })
                          .join(", ")
                      : "Chưa chọn bàn"}
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={onClose}>
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleAddTables}
                    disabled={isSubmitting || isAdding || tablesToAdd.length === 0}
                  >
                    {(isSubmitting || isAdding) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm bàn
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}