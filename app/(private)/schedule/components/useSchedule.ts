import { useState, useEffect } from "react";
import {
  useGetShiftsByDateRangeQuery,
  useGetShiftByIdQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
  useCreateQrMutation,
  useCreateShiftAttendMutation,
  useCreateQrCheckoutMutation, 
} from "@/features/schedule/scheduleApiSlice";
import { startOfWeek, endOfWeek, format, addMinutes } from "date-fns";
import { Shift, AddShiftRequest, UpdateShiftRequest, CheckinSuccessResponse, CheckInSuccessRequest } from "@/features/schedule/types";

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
  const [createQr] = useCreateQrMutation(); 
  const [createQrCheckout] = useCreateQrCheckoutMutation(); // Hook cho check-out
  const [createShiftAttend] = useCreateShiftAttendMutation();
  
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const shifts = data?.data || [];

  useEffect(() => {
    if (selectedShiftId !== null) {
    }
  }, [selectedShiftId]);

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
      setSelectedShiftId(shift.id);
      setIsUpdateDialogOpen(true);
    }
  };

  const handleCheckInFromQR = async (
    scheduleId: number,
    expiry: number,
    signature: string,
    username: string,
    password: string
  ): Promise<CheckinSuccessResponse> => {
    try {
      const checkInRequest: CheckInSuccessRequest = {
        scheduleId,
        expiry,
        signature,
        username,
        password,
      };

      const response = await createShiftAttend(checkInRequest).unwrap();
      return response;
    } catch (error) {
      console.error("Lỗi khi check-in:", error);
      throw error;
    }
  };

  // Tạo mã QR cho check-in
  const handleGetQrCode = async (id: number): Promise<{ url: string; expiration?: Date } | null> => {
    try {
      const qrResponse = await createQr(id).unwrap();
  
      if ('url' in qrResponse) {
        const qrImageUrl = qrResponse.url;
        const expiration = addMinutes(new Date(), 1);
        return { url: qrImageUrl, expiration };
      } else {
        console.error("Phản hồi không phải Blob, có thể là lỗi:", qrResponse);
        if (qrResponse.httpStatus === 500) {
          throw new Error(`Lỗi máy chủ: ${qrResponse.message || "Không xác định"}`);
        } else {
          throw new Error(`Lỗi: ${qrResponse.message || "Không lấy được mã QR"}`);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy mã QR:", error);
      throw error;
    }
  };

  // Tạo mã QR cho check-out (tương tự check-in)
  const handleGetQrCodeCheckout = async (id: number): Promise<{ url: string; expiration?: Date } | null> => {
    try {
      const qrResponse = await createQrCheckout(id).unwrap();
  
      if ('url' in qrResponse) {
        const qrImageUrl = qrResponse.url;
        const expiration = addMinutes(new Date(), 1);
        return { url: qrImageUrl, expiration };
      } else {
        console.error("Phản hồi không phải Blob, có thể là lỗi:", qrResponse);
        if (qrResponse.httpStatus === 500) {
          throw new Error(`Lỗi máy chủ: ${qrResponse.message || "Không xác định"}`);
        } else {
          throw new Error(`Lỗi: ${qrResponse.message || "Không lấy được mã QR check-out"}`);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy mã QR check-out:", error);
      throw error;
    }
  };

  const handleSubmit = async (formData: AddShiftRequest | UpdateShiftRequest, shiftId?: number): Promise<void> => {
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
    handleGetQrCode,
    handleGetQrCodeCheckout, 
    isLoadingShift,
    handleCheckInFromQR,
  };
}