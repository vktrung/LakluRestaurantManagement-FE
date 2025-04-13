'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Edit, Trash2, Info, Moon, Clock, User } from 'lucide-react';
import type { Shift } from '@/features/schedule/types';
import { format, parseISO, isAfter, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ScheduleWeekViewProps {
  formattedSchedule: {
    [dayOfWeek: string]: { time: string; shifts: Shift[] }[];
  };
  handleOpenDialog: (shift: Shift) => void;
  handleDelete: (id: number) => void;
  handleGetQrCode: (
    id: number,
  ) => Promise<{ url: string; expiration?: Date } | null>;
  handleGetQrCodeCheckout: (
    id: number,
  ) => Promise<{ url: string; expiration?: Date } | null>;
}

type DayName =
  | 'Thứ 2'
  | 'Thứ 3'
  | 'Thứ 4'
  | 'Thứ 5'
  | 'Thứ 6'
  | 'Thứ 7'
  | 'Chủ Nhật';

export default function ScheduleWeekView({
  formattedSchedule,
  handleOpenDialog,
  handleDelete,
  handleGetQrCode,
  handleGetQrCodeCheckout,
}: ScheduleWeekViewProps) {
  const fullWeekDays: DayName[] = [
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
    'Chủ Nhật',
  ];

  const dayIndices: Record<DayName, number> = {
    'Thứ 2': 0,
    'Thứ 3': 1,
    'Thứ 4': 2,
    'Thứ 5': 3,
    'Thứ 6': 4,
    'Thứ 7': 5,
    'Chủ Nhật': 6,
  };

  const safeFormattedSchedule = formattedSchedule || {};

  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [overnightShifts, setOvernightShifts] = useState<
    {
      shift: Shift;
      startDay: DayName;
      endDay: DayName;
      rowIndex: number;
      spanDays: number;
    }[]
  >([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<number | null>(null);

  // State cho Check-in
  const [isQrDialogOpenCheckIn, setIsQrDialogOpenCheckIn] = useState(false);
  const [qrImageUrlCheckIn, setQrImageUrlCheckIn] = useState<string | null>(
    null,
  );
  const [qrExpirationTimeCheckIn, setQrExpirationTimeCheckIn] =
    useState<Date | null>(null);

  // State cho Check-out
  const [isQrDialogOpenCheckOut, setIsQrDialogOpenCheckOut] = useState(false);
  const [qrImageUrlCheckOut, setQrImageUrlCheckOut] = useState<string | null>(
    null,
  );
  const [qrExpirationTimeCheckOut, setQrExpirationTimeCheckOut] =
    useState<Date | null>(null);

  // Lấy ngày hiện tại
  const currentDate = new Date();

  useEffect(() => {
    const overnight: {
      shift: Shift;
      startDay: DayName;
      endDay: DayName;
      rowIndex: number;
      spanDays: number;
    }[] = [];

    Object.entries(safeFormattedSchedule).forEach(([day, dayData]) => {
      if (fullWeekDays.includes(day as DayName)) {
        const typedDay = day as DayName;
        dayData.forEach((timeSlot, rowIndex) => {
          timeSlot.shifts.forEach(shift => {
            if (isOvernightShift(shift.timeIn, shift.timeOut)) {
              const startDayIndex = dayIndices[typedDay];
              const spanDays = getSpanDays(shift.timeIn, shift.timeOut);
              let endDayIndex = startDayIndex + spanDays - 1;
              if (endDayIndex >= fullWeekDays.length) {
                endDayIndex = endDayIndex % fullWeekDays.length;
              }
              const endDay = fullWeekDays[endDayIndex];

              overnight.push({
                shift,
                startDay: typedDay,
                endDay,
                rowIndex,
                spanDays,
              });
            }
          });
        });
      }
    });

    setOvernightShifts(overnight);
  }, [safeFormattedSchedule]);

  // Giải phóng URL khi component unmount hoặc đóng pop-up
  useEffect(() => {
    return () => {
      if (qrImageUrlCheckIn) URL.revokeObjectURL(qrImageUrlCheckIn);
      if (qrImageUrlCheckOut) URL.revokeObjectURL(qrImageUrlCheckOut);
    };
  }, [qrImageUrlCheckIn, qrImageUrlCheckOut]);

  const getSpanDays = (timeIn: string, timeOut: string) => {
    try {
      const inTime = parseISO(timeIn);
      const outTime = parseISO(timeOut);
      if (isAfter(outTime, inTime)) {
        const span = differenceInDays(outTime, inTime) + 1;
        return span > 0 ? span : 1;
      }
      return 1;
    } catch (error) {
      return 1;
    }
  };

  const isOvernightShift = (timeIn: string, timeOut: string) => {
    try {
      const inTime = parseISO(timeIn);
      const outTime = parseISO(timeOut);
      return (
        isAfter(outTime, inTime) &&
        format(inTime, 'yyyy-MM-dd') !== format(outTime, 'yyyy-MM-dd')
      );
    } catch (error) {
      return false;
    }
  };

  const shouldHideCell = (day: DayName, rowIndex: number) => {
    return overnightShifts.some(
      os =>
        os.rowIndex === rowIndex &&
        dayIndices[day] > dayIndices[os.startDay] &&
        dayIndices[day] < dayIndices[os.endDay],
    );
  };

  const getCellColSpan = (day: DayName, rowIndex: number) => {
    const overnightShift = overnightShifts.find(
      os => os.startDay === day && os.rowIndex === rowIndex,
    );

    if (overnightShift) {
      const startIndex = dayIndices[overnightShift.startDay];
      const endIndex = dayIndices[overnightShift.endDay];
      let colSpan = endIndex - startIndex + 1;
      if (colSpan < 0) colSpan += fullWeekDays.length;
      return Math.min(colSpan, fullWeekDays.length - startIndex);
    }
    return 1;
  };

  const formatTime = (timeString: string) => {
    try {
      const date = parseISO(timeString);
      return format(date, 'HH:mm', { locale: vi });
    } catch (error) {
      return timeString;
    }
  };

  const formatDate = (timeString: string) => {
    try {
      const date = parseISO(timeString);
      return format(date, 'dd/MM', { locale: vi });
    } catch (error) {
      return '';
    }
  };

  const formatDateTime = (date: Date) => {
    return format(date, 'HH:mm, dd/MM/yyyy', { locale: vi });
  };

  const getDayNameFromDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      const dayNumber = Number.parseInt(format(date, 'i', { locale: vi }));
      switch (dayNumber) {
        case 1:
          return 'Thứ 2';
        case 2:
          return 'Thứ 3';
        case 3:
          return 'Thứ 4';
        case 4:
          return 'Thứ 5';
        case 5:
          return 'Thứ 6';
        case 6:
          return 'Thứ 7';
        case 7:
          return 'Chủ Nhật';
        default:
          return '';
      }
    } catch (error) {
      return '';
    }
  };

  const confirmDelete = (id: number) => {
    setShiftToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const executeDelete = () => {
    if (shiftToDelete !== null) {
      handleDelete(shiftToDelete);
      setIsDeleteConfirmOpen(false);
      setShiftToDelete(null);
    }
  };

  const onCheckIn = async (id: number) => {
    try {
      const qrData = await handleGetQrCode(id);
      if (qrData) {
        setQrImageUrlCheckIn(qrData.url);
        setQrExpirationTimeCheckIn(qrData.expiration || null);
        setIsQrDialogOpenCheckIn(true);
      } else {
        alert('Không thể lấy mã QR check-in, vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Lỗi khi lấy mã QR check-in:', error);
    }
  };

  const onCheckOut = async (id: number) => {
    try {
      const qrData = await handleGetQrCodeCheckout(id);
      if (qrData) {
        setQrImageUrlCheckOut(qrData.url);
        setQrExpirationTimeCheckOut(qrData.expiration || null);
        setIsQrDialogOpenCheckOut(true);
      } else {
        alert('Không thể lấy mã QR check-out, vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Lỗi khi lấy mã QR check-out:', error);
    }
  };

  const shouldShowCheckInButton = (shift: Shift) => {
    const currentTime = currentDate;
    const timeIn = parseISO(shift.timeIn);
    const timeOut = parseISO(shift.timeOut);

    const shiftStartDate = new Date(timeIn);
    const shiftEndDate = new Date(timeOut);
    const currentDay = format(currentDate, 'yyyy-MM-dd');
    const shiftStartDay = format(shiftStartDate, 'yyyy-MM-dd');
    const shiftEndDay = format(shiftEndDate, 'yyyy-MM-dd');

    // Điều kiện 1: Ngày hiện tại phải khớp với ngày của ca hoặc ca liên ngày
    const isSameDayOrOvernight =
      currentDay === shiftStartDay ||
      currentDay === shiftEndDay ||
      isOvernightShift(shift.timeIn, shift.timeOut);

    // Điều kiện 2: Thời gian hiện tại nằm trong khoảng giữa timeIn và timeOut
    const isAfterStartTime =
      isAfter(currentTime, timeIn) ||
      currentTime.getTime() === timeIn.getTime();
    const isBeforeEndTime = !isAfter(currentTime, timeOut);

    return isSameDayOrOvernight && isAfterStartTime && isBeforeEndTime;
  };

  // Kiểm tra xem ca đã qua thời gian checkout chưa
  const isShiftPastCheckoutTime = (shift: Shift) => {
    const currentTime = currentDate;
    const timeOut = parseISO(shift.timeOut);
    return isAfter(currentTime, timeOut);
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              {fullWeekDays.map(day => (
                <th
                  key={day}
                  className="border-b border-gray-100 p-3 text-left text-gray-700 font-medium"
                >
                  <span>{day}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 2 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {fullWeekDays.map(weekDay => {
                  if (shouldHideCell(weekDay, rowIndex)) {
                    return null;
                  }

                  const daySchedule = safeFormattedSchedule[weekDay] || [];
                  const shifts = daySchedule[rowIndex]?.shifts || [];
                  const colSpan = getCellColSpan(weekDay, rowIndex);

                  return (
                    <td
                      key={weekDay}
                      className={cn(
                        'border border-gray-200 p-3 align-top',
                        rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                      )}
                      colSpan={colSpan}
                    >
                      <div className="space-y-2">
                        {shifts.length > 0 && (
                          <div className="mb-2 text-xs text-gray-500">
                            {shifts.length > 1
                              ? `${shifts.length} ca làm`
                              : '1 ca làm'}
                          </div>
                        )}
                        {shifts.map(shift => (
                          <Card
                            key={shift.id}
                            className={cn(
                              'border shadow-sm transition-all hover:shadow-md mb-2',
                              isOvernightShift(shift.timeIn, shift.timeOut)
                                ? 'border-violet-400 bg-violet-50'
                                : shifts.length > 1
                                ? 'border-green-400 bg-white'
                                : 'border-blue-400 bg-white',
                            )}
                          >
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-600" />
                                  <p className="text-sm font-medium text-gray-800">
                                    {shift.detail.managerFullName ||
                                      'Không có quản lý'}
                                  </p>
                                  {isOvernightShift(
                                    shift.timeIn,
                                    shift.timeOut,
                                  ) && (
                                    <Badge className="bg-violet-100 text-violet-800 text-xs">
                                      Ca đêm
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  {!isShiftPastCheckoutTime(shift) && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-gray-500 hover:text-blue-600"
                                      onClick={() => handleOpenDialog(shift)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-gray-500 hover:text-red-600"
                                    onClick={() => confirmDelete(shift.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-gray-500 hover:text-gray-600"
                                    onClick={() => setSelectedShift(shift)}
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4 text-gray-500 inline-block mr-2" />
                                {isOvernightShift(
                                  shift.timeIn,
                                  shift.timeOut,
                                ) ? (
                                  <span>
                                    {formatTime(shift.timeIn)} (
                                    {formatDate(shift.timeIn)}) →{' '}
                                    {formatTime(shift.timeOut)} (
                                    {formatDate(shift.timeOut)})
                                    <br />
                                    <span className="text-xs text-gray-500">
                                      {getDayNameFromDate(shift.timeIn)} -{' '}
                                      {getDayNameFromDate(shift.timeOut)}
                                    </span>
                                  </span>
                                ) : (
                                  <span>
                                    {formatTime(shift.timeIn)} -{' '}
                                    {formatTime(shift.timeOut)}
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 text-sm text-gray-600">
                                <span className="text-xs text-gray-400">
                                  ID: {shift.id}
                                </span>
                              </div>
                              <div className="mt-2 text-sm text-gray-600">
                                <User className="h-4 w-4 text-gray-500 inline-block mr-2" />
                                {shift.detail.numberOfStaff} nhân viên
                              </div>
                              <div className="flex gap-2 mt-2">
                                {shouldShowCheckInButton(shift) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    onClick={() => onCheckIn(shift.id)}
                                  >
                                    Check-in
                                  </Button>
                                )}
                                {shouldShowCheckInButton(shift) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    onClick={() => onCheckOut(shift.id)}
                                  >
                                    Check-out
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {!shifts.length && (
                          <div className="py-3 text-center text-gray-400 text-sm">
                            Không có ca làm
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pop-up hiển thị mã QR Check-in */}
      <Dialog
        open={isQrDialogOpenCheckIn}
        onOpenChange={setIsQrDialogOpenCheckIn}
      >
        <DialogContent className="sm:max-w-md rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
              <Clock className="h-5 w-5 text-sky-600" />
              Mã QR Check-in
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {qrImageUrlCheckIn ? (
              <img
                src={qrImageUrlCheckIn || '/placeholder.svg'}
                alt="QR Code Check-in"
                className="w-48 h-48 object-contain"
              />
            ) : (
              <p className="text-slate-600">Không thể tải mã QR check-in.</p>
            )}
            {qrExpirationTimeCheckIn && (
              <p className="text-sm text-slate-700">
                Hết hiệu lực lúc:{' '}
                <span className="font-semibold">
                  {formatDateTime(qrExpirationTimeCheckIn)}
                </span>
              </p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-100 text-slate-700"
              onClick={() => {
                setIsQrDialogOpenCheckIn(false);
                if (qrImageUrlCheckIn) {
                  URL.revokeObjectURL(qrImageUrlCheckIn);
                  setQrImageUrlCheckIn(null);
                }
                setQrExpirationTimeCheckIn(null);
              }}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pop-up hiển thị mã QR Check-out */}
      <Dialog
        open={isQrDialogOpenCheckOut}
        onOpenChange={setIsQrDialogOpenCheckOut}
      >
        <DialogContent className="sm:max-w-md rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
              <Clock className="h-5 w-5 text-sky-600" />
              Mã QR Check-out
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {qrImageUrlCheckOut ? (
              <img
                src={qrImageUrlCheckOut || '/placeholder.svg'}
                alt="QR Code Check-out"
                className="w-48 h-48 object-contain"
              />
            ) : (
              <p className="text-slate-600">Không thể tải mã QR check-out.</p>
            )}
            {qrExpirationTimeCheckOut && (
              <p className="text-sm text-slate-700">
                Hết hiệu lực lúc:{' '}
                <span className="font-semibold">
                  {formatDateTime(qrExpirationTimeCheckOut)}
                </span>
              </p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-100 text-slate-700"
              onClick={() => {
                setIsQrDialogOpenCheckOut(false);
                if (qrImageUrlCheckOut) {
                  URL.revokeObjectURL(qrImageUrlCheckOut);
                  setQrImageUrlCheckOut(null);
                }
                setQrExpirationTimeCheckOut(null);
              }}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal chi tiết */}
      {selectedShift && (
        <Dialog open={true} onOpenChange={() => setSelectedShift(null)}>
          <DialogContent className="sm:max-w-md rounded-xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
                <Info className="h-5 w-5 text-sky-600" />
                Chi tiết ca làm
                {isOvernightShift(
                  selectedShift.timeIn,
                  selectedShift.timeOut,
                ) && (
                  <Badge className="bg-purple-100 text-purple-800 text-xs py-1 px-2 rounded-full">
                    <Moon className="h-3 w-3 mr-1" /> Ca đêm
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 text-slate-700">
                    <Clock className="h-5 w-5 text-sky-600 mt-1" />
                    <div>
                      <p className="font-semibold">Thời gian</p>
                      {isOvernightShift(
                        selectedShift.timeIn,
                        selectedShift.timeOut,
                      ) ? (
                        <div>
                          <p className="text-sm">
                            {formatTime(selectedShift.timeIn)} (
                            {formatDate(selectedShift.timeIn)}) →{' '}
                            {formatTime(selectedShift.timeOut)} (
                            {formatDate(selectedShift.timeOut)})
                          </p>
                          <p className="text-xs text-gray-500">
                            {getDayNameFromDate(selectedShift.timeIn)} -{' '}
                            {getDayNameFromDate(selectedShift.timeOut)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm">
                          {formatTime(selectedShift.timeIn)} -{' '}
                          {formatTime(selectedShift.timeOut)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-semibold">Quản lý</p>
                      <p className="text-sm text-slate-600">
                        {selectedShift.detail.managerFullName || 'Không có'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-semibold">Số nhân viên</p>
                      <p className="text-sm text-slate-600">
                        {selectedShift.detail.numberOfStaff} nhân viên
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardContent className="p-4">
                  <div>
                    <p className="font-semibold">Danh sách nhân viên</p>
                    {selectedShift.detail.userFullNames &&
                    selectedShift.detail.userFullNames.length > 0 ? (
                      <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                        {selectedShift.detail.userFullNames.map(
                          (fullName, index) => (
                            <li
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <span>{fullName}</span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  selectedShift.detail
                                    .userAttendancesByFullName[fullName]
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {selectedShift.detail.userAttendancesByFullName[
                                  fullName
                                ]
                                  ? 'Có mặt'
                                  : 'Vắng mặt'}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-600">
                        Không có danh sách nhân viên
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Info className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-semibold">Ghi chú</p>
                      <p className="text-sm text-slate-600 italic">
                        {selectedShift.detail.note || 'Không có ghi chú'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                className="bg-white hover:bg-gray-100 text-slate-700"
                onClick={() => setSelectedShift(null)}
              >
                Đóng
              </Button>
              {!isShiftPastCheckoutTime(selectedShift) && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setSelectedShift(null);
                    handleOpenDialog(selectedShift);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Xác nhận xóa ca làm
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-700">
            <p>
              Bạn có chắc chắn muốn xóa ca làm này? Hành động này không thể hoàn
              tác.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-100 text-slate-700"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={executeDelete}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
