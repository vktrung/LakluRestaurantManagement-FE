'use client';

import { useState } from 'react';
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
import { format, parseISO } from 'date-fns';
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
import type { Shift } from '@/features/schedule/types';

interface ScheduleListViewProps {
  formattedStaffSchedule: Shift[];
  handleOpenDialog: (shift: Shift) => void;
  handleDelete: (id: number) => void;
}

export default function ScheduleListView({
  formattedStaffSchedule,
  handleOpenDialog,
  handleDelete,
}: ScheduleListViewProps) {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

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

  return (
    <div className="space-y-4">
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
        formattedStaffSchedule.map(shift => {
          const isOvernight = isOvernightShift(shift.timeIn, shift.timeOut);
          const attendanceStatus = getAttendanceStatus(shift.detail.attended);

          return (
            <Card
              key={shift.id}
              className={`transition-all hover:shadow-lg border rounded-lg shadow-sm ${
                isOvernight
                  ? 'border-l-4 border-l-violet-500 bg-violet-50'
                  : 'border-l-4 border-l-blue-500 bg-white'
              } hover:border-gray-300`}
            >
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <h3 className="font-medium text-sm text-gray-800">
                    {shift.date} ({shift.dayOfWeek})
                  </h3>
                  {isOvernight && (
                    <Badge className="ml-2 bg-violet-100 text-violet-800 border-violet-200 gap-1">
                      <Moon className="h-3 w-3" /> Ca đêm
                    </Badge>
                  )}
                  {getAttendanceBadge(attendanceStatus)}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-blue-600"
                  onClick={() => setSelectedShift(shift)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="px-4 pb-4 pt-0">
                <div className="grid gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-800">
                      {isOvernight ? (
                        <span>
                          {formatTime(shift.timeIn)} ({formatDate(shift.timeIn)}
                          ) → {formatTime(shift.timeOut)} (
                          {formatDate(shift.timeOut)})
                        </span>
                      ) : (
                        <span>
                          {formatTime(shift.timeIn)} -{' '}
                          {formatTime(shift.timeOut)}
                        </span>
                      )}
                    </span>
                  </div>

               
                  <Separator className="my-1" />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-600">Quản lý:</span>
                      <span className="font-medium truncate text-gray-800">
                        {shift.detail.manager || 'Không có'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-600">Số nhân viên:</span>
                      <span className="font-medium text-gray-800">
                        {shift.detail.numberOfStaff}
                      </span>
                    </div>
                  </div>

                  {shift.detail.note && (
                    <div className="flex items-start gap-2 text-sm mt-1">
                      <ClipboardList className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-600">Ghi chú:</span>
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
        })
      )}

      {/* Dialog chi tiết (View Only) */}
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
                            {selectedShift.dayOfWeek}
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
                        {selectedShift.detail.manager || 'Không có'}
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
                  <div className="flex items-start gap-2 text-slate-700">
                    <User className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-semibold">Danh sách nhân viên</p>
                      {selectedShift.detail.usernames &&
                      selectedShift.detail.usernames.length > 0 ? (
                        <ul className="text-sm text-slate-600 list-disc list-inside">
                          {selectedShift.detail.usernames.map(
                            (username, index) => (
                              <li key={index}>{username}</li>
                            ),
                          )}
                        </ul>
                      ) : selectedShift.detail.usernames &&
                        selectedShift.detail.usernames.length > 0 ? (
                        <ul className="text-sm text-slate-600 list-disc list-inside">
                          {selectedShift.detail.usernames.map(
                            (username, index) => (
                              <li key={index}>{username}</li>
                            ),
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

              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Info className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-semibold">Trạng thái</p>
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
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                className="bg-white hover:bg-gray-100 text-slate-700"
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
