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
  useGetShiftsByStaffAndDateRangeQuery,
} from "@/features/schedule/scheduleApiSlice";
import {
  useGetUserMeQuery, 
} from "@/features/auth/authApiSlice";
import { startOfWeek, endOfWeek, format, addMinutes } from "date-fns";
import { Shift, AddShiftRequest, UpdateShiftRequest, CheckinSuccessResponse, CheckInSuccessRequest, GetShiftsByStaffAndDateRangeRequest } from "@/features/schedule/types";
import { vi } from 'date-fns/locale';

export function useSchedule(currentDate: Date) {
  const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), "dd/MM/yyyy");
  const weekEnd = format(endOfWeek(currentDate, { weekStartsOn: 1 }), "dd/MM/yyyy");

  // Lấy thông tin người dùng hiện tại để lấy staffId
  const { data: userMeData, isLoading: isLoadingUserMe, error: userMeError } = useGetUserMeQuery();

  // Lấy staffId từ userMeData (giả định staffId nằm trong userMeData.data.id)
  const defaultStaffId = userMeData?.data?.id || null;

  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(defaultStaffId);

  // Cập nhật selectedStaffId khi userMeData thay đổi (lần đầu tải)
  useEffect(() => {
    if (defaultStaffId !== null && selectedStaffId === null) {
      setSelectedStaffId(defaultStaffId);
    }
  }, [defaultStaffId]);

  // Lấy dữ liệu ca làm theo khoảng thời gian chung
  const { data: generalData } = useGetShiftsByDateRangeQuery(
    { startDate: weekStart, endDate: weekEnd }
  );

  // Lấy dữ liệu ca làm theo selectedStaffId và khoảng thời gian
  const { data: staffData } = useGetShiftsByStaffAndDateRangeQuery(
    selectedStaffId
      ? { staffId: selectedStaffId, startDate: weekStart, endDate: weekEnd }
      : (undefined as any), // Bỏ qua nếu chưa có selectedStaffId
    { skip: !selectedStaffId } // Chỉ gọi API khi có selectedStaffId
  );

  // Hàm định dạng lịch cho ScheduleWeekView
  function formatSchedule(shifts: Shift[]) {
    const scheduleMap: { [day: string]: { time: string; shifts: Shift[] }[] } = {
      "Thứ 2": [],
      "Thứ 3": [],
      "Thứ 4": [],
      "Thứ 5": [],
      "Thứ 6": [],
      "Thứ 7": [],
      "Chủ Nhật": [],
    };

    // Sắp xếp ca làm theo thời gian bắt đầu
    const sortedShifts = [...shifts].sort((a, b) => 
      new Date(a.timeIn).getTime() - new Date(b.timeIn).getTime()
    );

    sortedShifts.forEach((shift) => {
      const inDate = new Date(shift.timeIn);
      const dayOfWeek = inDate.getDay();
      const dayIndex = dayOfWeek === 0 ? 7 : dayOfWeek;
      const day = dayIndex === 7 ? "Chủ Nhật" : `Thứ ${dayIndex + 1}`;
      const time = `${shift.timeIn} - ${shift.timeOut}`;

      // Kiểm tra xem đã có time slot nào cho khung giờ này chưa
      let existingTimeSlot = scheduleMap[day].find(slot => slot.time === time);
      
      if (existingTimeSlot) {
        // Kiểm tra xem shift đã tồn tại trong slot này chưa (dựa vào ID)
        const shiftExists = existingTimeSlot.shifts.some(s => s.id === shift.id);
        if (!shiftExists) {
          existingTimeSlot.shifts.push(shift);
        }
      } else {
        // Tạo time slot mới nếu chưa có
        scheduleMap[day].push({ time, shifts: [shift] });
      }
    });

    // Sắp xếp các time slot theo thời gian bắt đầu
    Object.keys(scheduleMap).forEach(day => {
      scheduleMap[day].sort((a, b) => {
        const timeA = a.shifts[0]?.timeIn || "";
        const timeB = b.shifts[0]?.timeIn || "";
        return new Date(timeA).getTime() - new Date(timeB).getTime();
      });
    });

    return scheduleMap;
  }

  // Hàm định dạng dữ liệu cho ScheduleListView (ca làm của nhân viên)
  function formatStaffSchedule(shifts: Shift[]) {
    return shifts.map(shift => ({
      ...shift,
      date: format(new Date(shift.timeIn), "dd/MM/yyyy"),
      dayOfWeek: format(new Date(shift.timeIn), "EEEE", { locale: vi }),
    }));
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
  const shifts = generalData?.data || [];
  const staffShifts = staffData?.data || [];

  useEffect(() => {
    if (selectedShiftId !== null) {
      // Logic nếu cần khi selectedShiftId thay đổi
    }
  }, [selectedShiftId]);

  const { data: selectedShiftResponse, isLoading: isLoadingShift } = useGetShiftByIdQuery(
    selectedShiftId!, { skip: !selectedShiftId }
  );

  const selectedShift = selectedShiftResponse?.data || null;

  const handleOpenAddDialog = (day?: string) => {
    setSelectedShiftId(null);
    setIsDialogOpen(true);
  };

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

  // Tạo mã QR cho check-out
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
  
    try {
      if (id !== null && id !== undefined) { 
        await updateShift({ id, body: formData }).unwrap();
      } else {
        await createShift(formData).unwrap();
      }
    } catch (error) {
      console.error("Lỗi khi xử lý ca làm:", error);
      // Ném lại lỗi để component cha có thể xử lý
      throw error;
    }
  };

  // Hàm xóa ca làm
  const handleDelete = async (id: number) => {
    await deleteShift(id);
  };

  return {
    formattedSchedule: formatSchedule(shifts), 
    formattedStaffSchedule: formatStaffSchedule(staffShifts), 
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
    selectedStaffId,
    setSelectedStaffId, 
    isLoadingUserMe, 
    userMeError, 
    userMeData,
  };
}