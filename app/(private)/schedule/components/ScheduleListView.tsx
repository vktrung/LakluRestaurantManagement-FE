'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Eye,
  User,
  Clock,
  Moon,
  Calendar,
  ClipboardList,
  Sun,
  Sunset,
  SunMoon,
  Info,
} from 'lucide-react';
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Shift } from '@/features/schedule/types';
import { useGetShiftsByStaffAndDateRangeQuery } from '@/features/schedule/scheduleApiSlice';

interface ScheduleListViewProps {
  formattedStaffSchedule: Shift[];
  handleOpenDialog: (shift: Shift) => void;
  handleDelete: (id: number) => void;
  currentDate: Date;
}

// Helper functions
const isOvernightShift = (timeIn: string, timeOut: string) => {
  try {
    const inTime = parseISO(timeIn);
    const outTime = parseISO(timeOut);
    return format(inTime, 'yyyy-MM-dd') !== format(outTime, 'yyyy-MM-dd');
  } catch (error) {
    return false;
  }
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

const getAttendanceStatus = (attended: string | boolean | undefined) => {
  if (attended === 'true' || attended === true) {
    return 'Present';
  } else if (attended === 'false' || attended === false) {
    return 'Absent';
  }
  return 'Unknown';
};

const getAttendanceBadge = (status: string) => {
  switch (status) {
    case 'Present':
      return (
        <Badge className="ml-2 bg-green-500 text-white border-green-600">
          Có mặt
        </Badge>
      );
    case 'Absent':
      return (
        <Badge className="ml-2 bg-red-500 text-white border-red-600">
          Vắng mặt
        </Badge>
      );
    default:
      return (
        <Badge className="ml-2 bg-gray-200 text-gray-800 border-gray-300">
          Chưa xác định
        </Badge>
      );
  }
};

const getShiftTypeIcon = (shiftType: string) => {
  switch (shiftType) {
    case 'MORNING':
      return <Sun className="h-4 w-4 text-yellow-500" />;
    case 'EVENING':
      return <Sunset className="h-4 w-4 text-orange-500" />;
    case 'NIGHT':
      return <Moon className="h-4 w-4 text-indigo-500" />;
    default:
      return <SunMoon className="h-4 w-4 text-gray-500" />;
  }
};

export default function ScheduleListView({
  formattedStaffSchedule,
  handleOpenDialog,
  handleDelete,
  currentDate,
}: ScheduleListViewProps) {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const currentWeek = currentDate;
  const [attendanceFilter, setAttendanceFilter] = useState<
    'all' | 'present' | 'absent'
  >('all');

  // Get week days
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentWeek]);

  // Filter shifts by attendance status
  const filteredShifts = useMemo(() => {
    return formattedStaffSchedule.filter(shift => {
      if (attendanceFilter === 'all') return true;
      const status = getAttendanceStatus(shift.detail.attended);
      return attendanceFilter === 'present'
        ? status === 'Present'
        : status === 'Absent';
    });
  }, [formattedStaffSchedule, attendanceFilter]);

  // Group shifts by day
  const shiftsByDay = useMemo(() => {
    const grouped: { [key: string]: Shift[] } = {};
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = [];
    });

    filteredShifts.forEach(shift => {
      const dayKey = format(parseISO(shift.timeIn), 'yyyy-MM-dd');
      if (grouped[dayKey]) {
        grouped[dayKey].push(shift);
      }
    });

    return grouped;
  }, [filteredShifts, weekDays]);

  // Debug logs
  useEffect(() => {}, [
    formattedStaffSchedule,
    currentDate,
    weekDays,
    shiftsByDay,
  ]);

  const getAttendanceBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return (
          <Badge className="ml-2 bg-green-500 text-white border-green-600">
            Có mặt
          </Badge>
        );
      case 'Absent':
        return (
          <Badge className="ml-2 bg-red-500 text-white border-red-600">
            Vắng mặt
          </Badge>
        );
      default:
        return (
          <Badge className="ml-2 bg-gray-200 text-gray-800 border-gray-300">
            Chưa xác định
          </Badge>
        );
    }
  };

  const getShiftTypeIcon = (shiftType: string) => {
    switch (shiftType) {
      case 'MORNING':
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'EVENING':
        return <Sunset className="h-4 w-4 text-orange-500" />;
      case 'NIGHT':
        return <Moon className="h-4 w-4 text-indigo-500" />;
      default:
        return <SunMoon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="overflow-x-auto -mx-2 sm:-mx-4">
        <div className="flex min-w-full p-2 sm:p-4 gap-2">
          {weekDays.map((day, index) => {
            const isToday =
              format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            return (
              <div
                key={index}
                className={`flex-1 flex flex-col items-center p-2 rounded-lg ${
                  isToday ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}
              >
                <span className="text-xs sm:text-sm font-medium text-gray-600">
                  {format(day, 'EEE', { locale: vi })}
                </span>
                <span className="text-base sm:text-lg font-semibold text-gray-800">
                  {format(day, 'dd')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Filter Tabs */}
      <div className="px-2 sm:px-0">
        <Tabs
          value={attendanceFilter}
          onValueChange={value =>
            setAttendanceFilter(value as 'all' | 'present' | 'absent')
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="present">Có mặt</TabsTrigger>
            <TabsTrigger value="absent">Vắng mặt</TabsTrigger>
          </TabsList>

          <TabsContent value={attendanceFilter} className="mt-4">
            {formattedStaffSchedule.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Calendar className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-center">
                    Không có ca làm nào trong khoảng thời gian này.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {weekDays.map((day, index) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const dayShifts = shiftsByDay[dayKey] || [];

                  if (dayShifts.length === 0) return null;

                  return (
                    <div key={index} className="space-y-2">
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-800 px-2">
                        {format(day, 'EEEE, dd/MM/yyyy', { locale: vi })}
                      </h3>
                      <div className="space-y-2">
                        {dayShifts.map(shift => {
                          const isOvernight = isOvernightShift(
                            shift.timeIn,
                            shift.timeOut,
                          );
                          const attendanceStatus = getAttendanceStatus(
                            shift.detail.attended,
                          );

                          return (
                            <Card
                              key={shift.id}
                              className={`transition-all hover:shadow-lg border rounded-lg shadow-sm ${
                                isOvernight
                                  ? 'border-l-4 border-l-violet-500 bg-violet-50'
                                  : 'border-l-4 border-l-blue-500 bg-white'
                              } hover:border-gray-300`}
                            >
                              <CardHeader className="pb-2 pt-3 px-3 sm:px-4 flex flex-row items-start sm:items-center justify-between flex-wrap sm:flex-nowrap gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span className="text-xs sm:text-sm text-gray-800">
                                    {isOvernight ? (
                                      <span className="flex items-center gap-1 flex-wrap">
                                        <span>
                                          {formatTime(shift.timeIn)} (
                                          {formatDate(shift.timeIn)})
                                        </span>
                                        <span>→</span>
                                        <span>
                                          {formatTime(shift.timeOut)} (
                                          {formatDate(shift.timeOut)})
                                        </span>
                                      </span>
                                    ) : (
                                      <span>
                                        {formatTime(shift.timeIn)} -{' '}
                                        {formatTime(shift.timeOut)}
                                      </span>
                                    )}
                                  </span>
                                  <div className="flex gap-1 flex-wrap">
                                    {isOvernight && (
                                      <Badge className="bg-violet-100 text-violet-800 border-violet-200 gap-1">
                                        <Moon className="h-3 w-3" /> Ca đêm
                                      </Badge>
                                    )}
                                    {getAttendanceBadge(attendanceStatus)}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-blue-600 shrink-0"
                                  onClick={() => setSelectedShift(shift)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </CardHeader>

                              <CardContent className="px-3 sm:px-4 pb-3 pt-0">
                                <div className="grid gap-2">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                                      <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                      <span className="text-gray-600">
                                        Quản lý:
                                      </span>
                                      <span className="font-medium truncate text-gray-800">
                                        {shift.detail.managerFullName ||
                                          'Không có'}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                                      <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                      <span className="text-gray-600">
                                        Số nhân viên:
                                      </span>
                                      <span className="font-medium text-gray-800">
                                        {shift.detail.numberOfStaff}
                                      </span>
                                    </div>
                                  </div>

                                  {shift.detail.note && (
                                    <div className="flex items-start gap-2 text-xs sm:text-sm mt-1">
                                      <ClipboardList className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <span className="text-gray-600">
                                          Ghi chú:
                                        </span>
                                        <p className="mt-1 text-gray-800">
                                          {shift.detail.note}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Shift Detail Dialog */}
      {selectedShift && (
        <Dialog open={true} onOpenChange={() => setSelectedShift(null)}>
          <DialogContent className="sm:max-w-md rounded-lg max-h-[90vh] overflow-hidden">
            <DialogHeader className="px-4 py-3">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg text-slate-800">
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
            <div className="overflow-y-auto px-4 py-2 space-y-3">
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2 text-slate-700">
                    <Clock className="h-5 w-5 text-sky-600 mt-1" />
                    <div>
                      <p className="font-semibold text-sm">Thời gian</p>
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
                            {format(parseISO(selectedShift.timeIn), 'EEEE', {
                              locale: vi,
                            })}
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
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-semibold text-sm">Quản lý</p>
                      <p className="text-sm text-slate-600">
                        {selectedShift.detail.managerFullName || 'Không có'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="h-5 w-5 text-sky-600" />
                    <div className="w-full">
                      <p className="font-semibold text-sm">Số nhân viên</p>
                      <p className="text-sm text-slate-600">
                        {selectedShift.detail.numberOfStaff} nhân viên
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardContent className="p-3 pt-0 border-t border-gray-100">
                  <div className="flex items-start gap-2 text-slate-700">
                    <User className="h-5 w-5 text-sky-600" />
                    <div className="w-full">
                      <p className="font-semibold text-sm">
                        Danh sách nhân viên
                      </p>
                      {selectedShift.detail.userFullNames &&
                      selectedShift.detail.userFullNames.length > 0 ? (
                        <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
                          {selectedShift.detail.userFullNames.map(
                            (fullName, idx) => {
                              const isPresent =
                                selectedShift.detail.userAttendancesByFullName[
                                  fullName
                                ];
                              const clockData =
                                selectedShift.detail.userClockInClockOut?.[
                                  fullName
                                ];
                              return (
                                <li
                                  key={idx}
                                  className="rounded border px-3 py-2 flex flex-col bg-gray-50"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                      {fullName}
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full min-w-[64px] text-center ${
                                        isPresent
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {isPresent ? 'Có mặt' : 'Vắng mặt'}
                                    </span>
                                  </div>
                                  <div className="flex gap-4 mt-1 pl-1">
                                    <div className="flex items-center gap-1 min-w-[110px]">
                                      <span className="text-xs text-slate-500">
                                        Check-in:
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded min-w-[80px] text-center ${
                                          clockData?.clockIn
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}
                                      >
                                        {clockData?.clockIn || 'Chưa check-in'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 min-w-[110px]">
                                      <span className="text-xs text-slate-500">
                                        Check-out:
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded min-w-[80px] text-center ${
                                          clockData?.clockOut
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}
                                      >
                                        {clockData?.clockOut ||
                                          'Chưa check-out'}
                                      </span>
                                    </div>
                                  </div>
                                </li>
                              );
                            },
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-600">
                          Không có danh sách nhân viên
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Info className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-semibold text-sm">Ghi chú</p>
                      <p className="text-sm text-slate-600 italic">
                        {selectedShift.detail.note || 'Không có ghi chú'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Info className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-semibold text-sm">Trạng thái</p>
                      <p className="text-sm text-slate-600">
                        {getAttendanceStatus(selectedShift.detail.attended) ===
                        'Present'
                          ? 'Có mặt'
                          : getAttendanceStatus(
                              selectedShift.detail.attended,
                            ) === 'Absent'
                          ? 'Vắng mặt'
                          : 'Chưa xác định'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <DialogFooter className="px-4 py-3 border-t">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-white hover:bg-gray-100 text-slate-700"
                onClick={() => setSelectedShift(null)}
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
