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
import { Plus, Edit, Trash2, Info, Moon, Clock, User } from 'lucide-react';
import type { Shift } from '@/features/schedule/types';
import { format, parseISO, isAfter, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ScheduleWeekViewProps {
  formattedSchedule: {
    [dayOfWeek: string]: { time: string; shifts: Shift[] }[];
  };
  handleOpenDialog: (shift: Shift) => void;
  handleDelete: (id: number) => void;
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
                endDayIndex = endDayIndex % fullWeekDays.length; // Xử lý khi vượt qua Chủ Nhật
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

  const getSpanDays = (timeIn: string, timeOut: string) => {
    try {
      const inTime = parseISO(timeIn);
      const outTime = parseISO(timeOut);
      if (isAfter(outTime, inTime)) {
        const span = differenceInDays(outTime, inTime) + 1; // Tính đúng số ngày bao gồm cả ngày bắt đầu
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
      if (colSpan < 0) colSpan += fullWeekDays.length; // Xử lý khi vượt qua Chủ Nhật
      return Math.min(colSpan, fullWeekDays.length - startIndex); // Đảm bảo không vượt quá tuần
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

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-blue-50">
              {fullWeekDays.map(day => (
                <th
                  key={day}
                  className="border-b border-gray-200 p-4 text-left text-gray-700 font-semibold"
                >
                  <div className="flex justify-between items-center">
                    <span>{day}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-white hover:bg-blue-100 border-gray-300"
                            onClick={() => handleOpenDialog({} as Shift)}
                          >
                            <Plus className="h-4 w-4 text-blue-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>Thêm ca làm mới</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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
                        {shifts.map(shift => (
                          <Card
                            key={shift.id}
                            className={cn(
                              'border-l-4 shadow-sm transition-all',
                              isOvernightShift(shift.timeIn, shift.timeOut)
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-blue-500 bg-white',
                            )}
                          >
                            <CardContent className="p-4 relative">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <User className="h-5 w-5 text-indigo-600" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">
                                      {shift.detail.manager ||
                                        'Không có quản lý'}
                                    </p>
                                    {isOvernightShift(
                                      shift.timeIn,
                                      shift.timeOut,
                                    ) && (
                                      <Badge className="mt-1 bg-indigo-100 text-indigo-800 text-xs py-1 px-2 rounded">
                                        <Moon className="h-3 w-3 mr-1" /> Ca đêm
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                                          onClick={() =>
                                            handleOpenDialog(shift)
                                          }
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">
                                        <p>Chỉnh sửa</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-red-600 hover:bg-red-100"
                                          onClick={() =>
                                            confirmDelete(shift.id)
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">
                                        <p>Xóa ca làm</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                                          onClick={() =>
                                            setSelectedShift(shift)
                                          }
                                        >
                                          <Info className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">
                                        <p>Xem chi tiết</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                              <div className="mt-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4 text-indigo-600 inline-block mr-2" />
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
                                <User className="h-4 w-4 text-indigo-600 inline-block mr-2" />
                                {shift.detail.numberOfStaff} nhân viên
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {!shifts.length && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog({} as Shift)}
                            className="w-full flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-2" /> Thêm ca làm
                          </Button>
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

      {/* Modal chi tiết */}
      {selectedShift && (
        <Dialog open={true} onOpenChange={() => setSelectedShift(null)}>
          <DialogContent className="sm:max-w-md rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-gray-800">
                <Info className="h-5 w-5 text-blue-600" />
                Chi tiết ca làm
                {isOvernightShift(
                  selectedShift.timeIn,
                  selectedShift.timeOut,
                ) && (
                  <Badge className="bg-indigo-100 text-indigo-800 text-xs py-1 px-2 rounded-full">
                    <Moon className="h-3 w-3 mr-1" /> Ca đêm
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 text-gray-700">
                    <Clock className="h-5 w-5 text-blue-600 mt-1" />
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
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">Quản lý</p>
                      <p className="text-sm text-gray-600">
                        {selectedShift.detail.manager || 'Không có'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">Số nhân viên</p>
                      <p className="text-sm text-gray-600">
                        {selectedShift.detail.numberOfStaff} nhân viên
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 text-gray-700">
                    <User className="h-5 w-5 text-blue-600" />{' '}
                    <div>
                      <p className="font-semibold">Danh sách nhân viên</p>
                      {selectedShift.detail.usernames &&
                      selectedShift.detail.usernames.length > 0 ? (
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {selectedShift.detail.usernames.map(
                            (username, index) => (
                              <li key={index}>{username}</li>
                            ),
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Không có danh sách nhân viên
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Info className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">Ghi chú</p>
                      <p className="text-sm text-gray-600 italic">
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
                className="bg-white hover:bg-gray-100 text-gray-700"
                onClick={() => setSelectedShift(null)}
              >
                Đóng
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setSelectedShift(null);
                  handleOpenDialog(selectedShift);
                }}
              >
                <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Xác nhận xóa ca làm
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-gray-700">
            <p>
              Bạn có chắc chắn muốn xóa ca làm này? Hành động này không thể hoàn
              tác.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-100 text-gray-700"
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
