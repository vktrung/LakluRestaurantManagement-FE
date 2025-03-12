import { useState, useEffect } from "react";
import {
  useGetShiftsByDateRangeQuery,
  useGetShiftByIdQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
} from "@/features/schedule/scheduleApiSlice";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { Shift,AddShiftRequest,UpdateShiftRequest} from "@/features/schedule/types";

export function useSchedule(currentDate: Date) {
  const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), "dd/MM/yyyy");
  const weekEnd = format(endOfWeek(currentDate, { weekStartsOn: 1 }), "dd/MM/yyyy");

  const { data } = useGetShiftsByDateRangeQuery(
    { startDate: weekStart, endDate: weekEnd }
  );

  // Hàm định dạng lịch
  function formatSchedule(shifts: Shift[]) {
    const scheduleMap: { [day: string]: { time: string; shifts: Shift[] }[] } = {};

    shifts.forEach((shift) => {
      const inDate = new Date(shift.timeIn);
      const dayOfWeek = inDate.getDay();
      const dayIndex = dayOfWeek === 0 ? 7 : dayOfWeek;
      const day = dayIndex === 7 ? "Chủ Nhật" : `Thứ ${dayIndex + 1}`;
      const time = `${shift.timeIn} - ${shift.timeOut}`;

      if (!scheduleMap[day]) scheduleMap[day] = [];
      const existingSlot = scheduleMap[day].find((slot) => slot.time === time);
      if (existingSlot) {
        existingSlot.shifts.push(shift);
      } else {
        scheduleMap[day].push({ time, shifts: [shift] });
      }
    });

    return scheduleMap;
  }

  // Các hook mutation
  const [createShift] = useCreateShiftMutation();
  const [updateShift] = useUpdateShiftMutation();
  const [deleteShift] = useDeleteShiftMutation();

  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const shifts = data?.data || [];

  // Theo dõi sự thay đổi của selectedShiftId
  useEffect(() => {
    if (selectedShiftId !== null) {
      console.log("🛠 selectedShiftId has been updated to:", selectedShiftId);
    }
  }, [selectedShiftId]);

  // Lấy thông tin shift theo ID
  const { data: selectedShiftResponse, isLoading: isLoadingShift } = useGetShiftByIdQuery(
    selectedShiftId!, { skip: !selectedShiftId }
  );

  const selectedShift = selectedShiftResponse?.data || null;

  // Hàm mở dialog Thêm mới
  const handleOpenAddDialog = (day?: string) => {
    setSelectedShiftId(null);
    setIsDialogOpen(true);
  };

  // Hàm mở dialog Cập nhật
  const handleOpenUpdateDialog = (shift: Shift) => {
    if (shift && shift.id) {
      console.log("🛠 Opening Update Dialog with Shift ID:", shift.id);
      setSelectedShiftId(shift.id); // Cập nhật state để UI phản ánh
      setIsUpdateDialogOpen(true);
    } else {
      console.warn("⚠️ Không có shift ID để cập nhật");
    }
  };

  // Hàm tạo shift
  const handleCreateShift = async (formData: any) => {
    console.log("➕ Creating new shift");
    await createShift(formData);
    console.log("🔒 Closing dialog...");
    setIsDialogOpen(false);
    console.log("✅ New shift created.");
  };

  // Hàm cập nhật shift
  const handleUpdateShift = async (formData: any) => {
    if (!selectedShiftId) return;

    console.log("✏️ Updating shift ID:", selectedShiftId);
    await updateShift({ id: selectedShiftId, body: formData });
    console.log("🔒 Closing dialog...");
    setIsUpdateDialogOpen(false);
    console.log("✅ Shift updated.");
  };

  const handleSubmit = async (formData: AddShiftRequest | UpdateShiftRequest, shiftId?: number): Promise<void> => {
    console.log("📤 Submitting formData:", formData);
    console.log("✏️shift ID:", shiftId ?? selectedShiftId);
  
    const id = shiftId ?? selectedShiftId; 
  
    if (id !== null && id !== undefined) { 
      await updateShift({ id, body: formData });
    } else {
      await createShift(formData);
    }
  };

  

  // Hàm xóa ca làm
  const handleDelete = async (id: number) => {
    await deleteShift(id);
  };

  return {
    formattedSchedule: formatSchedule(shifts),
    handleOpenAddDialog,
    handleOpenUpdateDialog,
    handleDelete,
    handleSubmit,
    isDialogOpen,
    isUpdateDialogOpen,
    setIsDialogOpen,
    setIsUpdateDialogOpen,
    selectedShiftResponse,
    selectedShift,
    isLoadingShift,
  };
}