'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Copy,
  CalendarDays,
  Calendar,
  Info,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format, addWeeks, subWeeks, startOfWeek, setDay } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface ScheduleActionsProps {
  handleOpenAddDialog: (day?: string) => void;
  handleCloneSchedule: (
    sourceWeek: Date,
    targetWeek: Date,
    updateShiftType: boolean,
    overwriteExisting: boolean,
  ) => Promise<void>;
  currentDate: Date;
}

export default function ScheduleActions({
  handleOpenAddDialog,
  handleCloneSchedule,
  currentDate,
}: ScheduleActionsProps) {
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);
  const [sourceWeek, setSourceWeek] = useState<Date>(
    startOfWeek(currentDate, { weekStartsOn: 1 }),
  );
  const [targetWeek, setTargetWeek] = useState<Date>(
    startOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 }),
  );
  const [updateShiftType, setUpdateShiftType] = useState(true);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current date at the start of the week for proper comparison
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const handleCloneSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Ensure the dates are always Monday (start of week)
      const sourceWeekStart = startOfWeek(sourceWeek, { weekStartsOn: 1 });
      const targetWeekStart = startOfWeek(targetWeek, { weekStartsOn: 1 });

      // For display
      const sourceDisplayFormat = format(sourceWeekStart, 'dd/MM/yyyy');
      const targetDisplayFormat = format(targetWeekStart, 'dd/MM/yyyy');

      toast.info(
        `Đang sao chép lịch từ tuần ${sourceDisplayFormat} đến tuần ${targetDisplayFormat}...`,
        {
          duration: 2000,
        },
      );

      console.log(
        `Attempting to clone schedule from ${sourceDisplayFormat} to ${targetDisplayFormat}`,
      );
      console.log('Source date object:', sourceWeekStart);
      console.log('Target date object:', targetWeekStart);

      await handleCloneSchedule(
        sourceWeekStart,
        targetWeekStart,
        updateShiftType,
        overwriteExisting,
      );
      setIsCloneDialogOpen(false);
    } catch (error) {
      console.error('Lỗi khi sao chép lịch:', error);

      toast.error(`Không thể sao chép lịch. Vui lòng thử lại sau.`, {
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatWeekRange = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = addWeeks(weekStart, 1);
    return `${format(weekStart, 'dd/MM/yyyy')} - ${format(
      subWeeks(weekEnd, 1),
      'dd/MM/yyyy',
    )}`;
  };

  const handleSourceWeekChange = (date: Date | null) => {
    if (date) {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      setSourceWeek(weekStart);

      if (targetWeek < weekStart) {
        setTargetWeek(addWeeks(weekStart, 1));
      }
    }
  };

  const handleTargetWeekChange = (date: Date | null) => {
    if (date) {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      setTargetWeek(weekStart);
    }
  };

  return (
    <>
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenAddDialog()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Thêm lịch làm việc
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCloneDialogOpen(true)}
        >
          <Copy className="h-4 w-4 mr-1" />
          Sao chép lịch
        </Button>
      </div>

      <Dialog open={isCloneDialogOpen} onOpenChange={setIsCloneDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sao chép lịch làm việc</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="bg-blue-50 text-blue-800 border border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Chọn tuần nguồn và tuần đích để sao chép lịch làm việc. Bất kể
                bạn chọn ngày nào trong tuần, hệ thống sẽ tự động lấy cả tuần.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="sourceWeek" className="font-medium">
                Chọn tuần gốc để sao chép
              </Label>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <DatePicker
                    selected={sourceWeek}
                    onChange={handleSourceWeekChange}
                    dateFormat="dd/MM/yyyy"
                    locale={vi}
                    placeholderText="Chọn tuần gốc để sao chép"
                    className="w-full p-2 border rounded-md bg-gray-50 text-center"
                    calendarStartDay={1}
                    maxDate={currentWeekStart}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Tuần: {formatWeekRange(sourceWeek)}
              </p>
              <p className="text-xs text-orange-500">
                <AlertCircle className="h-3 w-3 mr-1 inline" />
                Chỉ được phép chọn tuần hiện tại hoặc các tuần trong quá khứ
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetWeek" className="font-medium">
                Tuần đến
              </Label>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <DatePicker
                    selected={targetWeek}
                    onChange={handleTargetWeekChange}
                    dateFormat="dd/MM/yyyy"
                    locale={vi}
                    placeholderText="Chọn tuần đến"
                    className="w-full p-2 border rounded-md bg-gray-50 text-center"
                    minDate={sourceWeek}
                    calendarStartDay={1}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Tuần: {formatWeekRange(targetWeek)}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="updateShiftType" className="cursor-pointer">
                Cập nhật loại ca làm
              </Label>
              <input
                type="checkbox"
                id="updateShiftType"
                checked={updateShiftType}
                onChange={e => setUpdateShiftType(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="overwriteExisting" className="cursor-pointer">
                Ghi đè ca làm hiện có
              </Label>
              <input
                type="checkbox"
                id="overwriteExisting"
                checked={overwriteExisting}
                onChange={e => setOverwriteExisting(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCloneDialogOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button onClick={handleCloneSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Sao chép'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
