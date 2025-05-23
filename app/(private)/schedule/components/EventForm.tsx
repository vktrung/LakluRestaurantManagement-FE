'use client';

import { useState, useEffect } from 'react';
import { useGetStaffQuery } from '@/features/staff/staffApiSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus, AlertCircle, Calendar, Clock } from 'lucide-react';
import {
  AddShiftRequest,
  UpdateShiftRequest,
  UserShift,
} from '@/features/schedule/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  format,
  parse,
  parseISO,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
} from 'date-fns';
import { Label } from '@/components/ui/label';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';

interface Props {
  shiftbyidResp?: any;
  onClose: () => void;
  currentDate: Date;
  handleSubmit: (
    formData: AddShiftRequest | UpdateShiftRequest,
  ) => Promise<void>;
  formError?: any;
  apiResponse?: any;
}

// Helper function để hiển thị gợi ý về định dạng thời gian
const DateTimeHelperNote = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
      <Calendar className="h-3 w-3" />
      <span>
        Gợi ý: Chọn ngày từ hôm nay ({format(new Date(), 'dd/MM/yyyy')}) trở đi
      </span>
    </div>
  );
};

export default function EventForm({
  shiftbyidResp,
  onClose,
  currentDate,
  handleSubmit,
  formError,
  apiResponse,
}: Props) {
  const { data: staffData, isLoading: isLoadingStaff } = useGetStaffQuery();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const [formData, setFormData] = useState<AddShiftRequest>({
    user: [{ staffId: 0, isManager: false }],
    shiftStart: '',
    shiftEnd: '',
    shiftType: 'MORNING',
    note: '',
  });

  const [staffs, setStaffs] = useState<UserShift[]>([
    { staffId: 0, isManager: false },
  ]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({
    shiftStart: '',
    shiftEnd: '',
    staffs: '',
  });

  useEffect(() => {
    console.log('🚀 shiftbyidResp received in EventForm:', shiftbyidResp);
    if (shiftbyidResp?.data) {
      console.log(
        '✅ Cập nhật formData với shiftbyidResp:',
        shiftbyidResp.data,
      );

      if (shiftbyidResp.data.shiftStart) {
        const startDateTime = new Date(shiftbyidResp.data.shiftStart);
        setStartDate(startDateTime);
        setStartTime(startDateTime);
      }

      if (shiftbyidResp.data.shiftEnd) {
        const endDateTime = new Date(shiftbyidResp.data.shiftEnd);
        setEndDate(endDateTime);
        setEndTime(endDateTime);
      }

      setFormData({
        user: shiftbyidResp.data.user || [{ staffId: 0, isManager: false }],
        shiftStart: shiftbyidResp.data.shiftStart || '',
        shiftEnd: shiftbyidResp.data.shiftEnd || '',
        shiftType: shiftbyidResp.data.shiftType || 'MORNING',
        note: shiftbyidResp.data.note || '',
      });

      setStaffs(shiftbyidResp.data.user || [{ staffId: 0, isManager: false }]);
    }
  }, [shiftbyidResp]);

  useEffect(() => {
    if (startDate && startTime) {
      const combinedStart = new Date(startDate);
      combinedStart.setHours(startTime.getHours());
      combinedStart.setMinutes(startTime.getMinutes());

      setFormData(prev => ({
        ...prev,
        shiftStart: format(combinedStart, "yyyy-MM-dd'T'HH:mm:ss"),
      }));
    }

    if (endDate && endTime) {
      const combinedEnd = new Date(endDate);
      combinedEnd.setHours(endTime.getHours());
      combinedEnd.setMinutes(endTime.getMinutes());

      setFormData(prev => ({
        ...prev,
        shiftEnd: format(combinedEnd, "yyyy-MM-dd'T'HH:mm:ss"),
      }));
    }
  }, [startDate, startTime, endDate, endTime]);

  useEffect(() => {
    if (startDate) {
      if (!endDate || endDate < startDate) {
        setEndDate(startDate);
      }
    }
  }, [startDate]);

  useEffect(() => {
    if (formError) {
      console.log('Form error received:', formError);

      // Hiển thị thông báo lỗi
      if (typeof formError === 'string') {
        setApiError(formError);
      } else if (formError.error && typeof formError.error === 'object') {
        // Ưu tiên lỗi manager
        if (formError.error.manager) {
          setApiError(formError.error.manager);
        }
        // Tiếp theo ưu tiên lỗi shiftType
        else if (formError.error.shiftType) {
          setApiError(formError.error.shiftType);
        }
        // Lấy lỗi đầu tiên nếu không có các lỗi ưu tiên
        else {
          const firstErrorKey = Object.keys(formError.error)[0];
          if (firstErrorKey && formError.error[firstErrorKey]) {
            setApiError(formError.error[firstErrorKey]);
          } else {
            setApiError(
              'Dữ liệu không hợp lệ. Vui lòng kiểm tra thông tin nhập vào.',
            );
          }
        }
      }
      // Nếu error là string
      else if (formError.error && typeof formError.error === 'string') {
        setApiError(formError.error);
      }
      // Nếu có message
      else if (formError.message) {
        setApiError(formError.message);
      }
      // Mặc định
      else {
        setApiError('Đã xảy ra lỗi khi lưu ca làm. Vui lòng thử lại sau.');
      }
    }
  }, [formError]);

  // Check API response
  useEffect(() => {
    if (apiResponse && apiResponse.httpStatus !== 200) {
      console.log('API Response Error:', apiResponse);

      // Check for nested error object
      if (apiResponse.error && typeof apiResponse.error === 'object') {
        const errorKeys = Object.keys(apiResponse.error);
        if (errorKeys.length > 0) {
          // Prioritize manager error if it exists
          if (apiResponse.error.manager) {
            setApiError(apiResponse.error.manager);
          } else {
            setApiError(apiResponse.error[errorKeys[0]]);
          }
          return;
        }
      }

      // If no specific error found, use general message
      setApiError(apiResponse.message || 'Đã xảy ra lỗi khi lưu ca làm');
    }
  }, [apiResponse]);

  const updateTimeByShiftType = (shiftType: string) => {
    const today = new Date();
    let newStartTime = new Date();
    let newEndTime = new Date();

    const currentStartDate = startDate || today;
    const currentEndDate =
      endDate && endDate >= currentStartDate ? endDate : currentStartDate;

    switch (shiftType) {
      case 'MORNING':
        newStartTime = setHours(setMinutes(today, 0), 6);
        newEndTime = setHours(setMinutes(today, 0), 12);
        break;
      case 'EVENING':
        newStartTime = setHours(setMinutes(today, 0), 12);
        newEndTime = setHours(setMinutes(today, 0), 18);
        break;
      case 'NIGHT':
        newStartTime = setHours(setMinutes(today, 0), 18);
        newEndTime = setHours(setMinutes(today, 0), 3);
        if (currentStartDate === currentEndDate) {
          const nextDay = new Date(currentEndDate);
          nextDay.setDate(nextDay.getDate() + 1);
          setEndDate(nextDay);
        }
        break;
    }

    setStartTime(newStartTime);
    setEndTime(newEndTime);
  };

  const hasManager = staffs.some(staff => staff.isManager);

  const addStaff = () => {
    setStaffs([...staffs, { staffId: 0, isManager: false }]);
  };

  const removeStaff = (index: number) => {
    setStaffs(staffs.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {
      shiftStart: '',
      shiftEnd: '',
      staffs: '',
    };
    let isValid = true;

    if (!startDate || !startTime) {
      errors.shiftStart = 'Vui lòng chọn ngày và giờ bắt đầu';
      isValid = false;
    }

    if (!endDate || !endTime) {
      errors.shiftEnd = 'Vui lòng chọn ngày và giờ kết thúc';
      isValid = false;
    }

    if (startDate && startTime) {
      const combinedStart = new Date(startDate);
      combinedStart.setHours(startTime.getHours());
      combinedStart.setMinutes(startTime.getMinutes());

      const now = new Date();
      const startDay = new Date(
        combinedStart.getFullYear(),
        combinedStart.getMonth(),
        combinedStart.getDate(),
      );
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (startDay < today) {
        errors.shiftStart =
          'Thời gian bắt đầu ca làm việc phải là hiện tại hoặc tương lai';
        isValid = false;
      }
    }

    if (startDate && startTime && endDate && endTime) {
      const combinedStart = new Date(startDate);
      combinedStart.setHours(startTime.getHours());
      combinedStart.setMinutes(startTime.getMinutes());

      const combinedEnd = new Date(endDate);
      combinedEnd.setHours(endTime.getHours());
      combinedEnd.setMinutes(endTime.getMinutes());

      if (combinedEnd <= combinedStart) {
        errors.shiftEnd = 'Thời gian kết thúc phải sau thời gian bắt đầu';
        isValid = false;
      }
    }

    if (!staffs.some(staff => staff.staffId > 0)) {
      errors.staffs = 'Vui lòng chọn ít nhất một nhân viên';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    const requestData = { ...formData, user: staffs };
    console.log('📤 Submitting requestData:', requestData);

    try {
      await handleSubmit(requestData);
      // Form will be closed by the parent component if response is successful
    } catch (error: any) {
      console.error('Lỗi khi thêm/cập nhật ca làm:', error);

      // Error handling is managed by useEffect monitoring formError
      // So we don't need to handle it here specifically
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lấy danh sách các staffId đã được chọn
  const selectedStaffIds = staffs.map(staff => staff.staffId);

  // Filter out resigned staff and admin users
  const filteredStaff =
    staffData?.data?.users?.filter(user => {
      const isWorking = user.profile?.employmentStatus === 'WORKING';
      const isNotAdmin = !user.username?.toLowerCase().includes('admin');

      return isWorking && isNotAdmin;
    }) || [];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {shiftbyidResp ? 'Chỉnh sửa ca làm' : 'Thêm ca làm'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 overflow-y-auto pr-1 max-h-[calc(90vh-120px)] custom-scrollbar"
        >
          {apiError && (
            <Alert variant="destructive" className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Loại ca <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.shiftType}
              onValueChange={value => {
                setFormData({
                  ...formData,
                  shiftType: value as
                    | 'MORNING'
                    | 'EVENING'
                    | 'NIGHT',
                });
                updateTimeByShiftType(value);
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn ca làm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MORNING">Ca sáng (6:00 - 12:00)</SelectItem>
                <SelectItem value="EVENING">
                  Ca chiều (12:00 - 18:00)
                </SelectItem>
                <SelectItem value="NIGHT">
                  Ca đêm (18:00 - 3:00 hôm sau)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              <Clock className="h-3 w-3 inline mr-1" />
              Các ca có thời điểm kết thúc sau 0:00 sẽ tự động đặt vào ngày hôm
              sau
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                locale={vi}
                placeholderText="Chọn ngày bắt đầu"
                className="w-full p-2 border rounded-md bg-gray-50 text-center"
                disabled={isSubmitting}
                minDate={new Date()}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Giờ bắt đầu <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                selected={startTime}
                onChange={time => setStartTime(time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                timeCaption="Giờ"
                dateFormat="HH:mm"
                locale={vi}
                placeholderText="Chọn giờ bắt đầu"
                className="w-full p-2 border rounded-md bg-gray-50 text-center"
                disabled={isSubmitting}
              />
            </div>
          </div>
          {formErrors.shiftStart && (
            <p className="text-red-500 text-xs mt-0">{formErrors.shiftStart}</p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Ngày kết thúc <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                dateFormat="dd/MM/yyyy"
                locale={vi}
                placeholderText="Chọn ngày kết thúc"
                className="w-full p-2 border rounded-md bg-gray-50 text-center"
                disabled={isSubmitting}
                minDate={startDate || new Date()}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Giờ kết thúc <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                selected={endTime}
                onChange={time => setEndTime(time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                timeCaption="Giờ"
                dateFormat="HH:mm"
                locale={vi}
                placeholderText="Chọn giờ kết thúc"
                className="w-full p-2 border rounded-md bg-gray-50 text-center"
                disabled={isSubmitting}
              />
            </div>
          </div>
          {formErrors.shiftEnd && (
            <p className="text-red-500 text-xs mt-0">{formErrors.shiftEnd}</p>
          )}
          {endDate && startDate && endDate < startDate && (
            <p className="text-amber-500 text-xs mt-0">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              Ngày kết thúc không thể sớm hơn ngày bắt đầu
            </p>
          )}

          <div className="bg-gray-100 p-3 rounded-md">
            <p className="font-semibold mb-2">Nhân viên trong ca:</p>
            {formErrors.staffs && (
              <p className="text-red-500 text-xs mb-2">{formErrors.staffs}</p>
            )}
            <div className="flex flex-col gap-2">
              {staffs.map((staff, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={staff.staffId > 0 ? staff.staffId.toString() : ''}
                    onValueChange={value => {
                      const newStaffs = [...staffs];
                      newStaffs[index].staffId = Number(value);
                      setStaffs(newStaffs);
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-1/2">
                      <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingStaff ? (
                        <SelectItem value="loading" disabled>
                          Đang tải...
                        </SelectItem>
                      ) : filteredStaff.length ? (
                        filteredStaff.map(s => (
                          <SelectItem
                            key={s.id}
                            value={s.id.toString()}
                            disabled={
                              selectedStaffIds.includes(s.id) &&
                              s.id !== staff.staffId
                            }
                          >
                            {s.profile.fullName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>
                          Không có nhân viên phù hợp
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  <Select
                    value={staff.isManager ? 'manager' : 'staff'}
                    onValueChange={value => {
                      const newStaffs = [...staffs];
                      if (value === 'manager') {
                        newStaffs.forEach(
                          (s, i) => (newStaffs[i].isManager = i === index),
                        );
                      } else {
                        newStaffs[index].isManager = false;
                      }
                      setStaffs(newStaffs);
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Nhân viên</SelectItem>
                      <SelectItem
                        value="manager"
                        disabled={hasManager && !staff.isManager}
                      >
                        Quản lý
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {staffs.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStaff(index)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                onClick={addStaff}
                className="w-full flex justify-center gap-2 mt-2"
                variant="outline"
                disabled={isSubmitting}
              >
                <Plus className="h-5 w-5" /> Thêm nhân viên
              </Button>
            </div>
          </div>

          <Input
            type="text"
            placeholder="Ghi chú (nếu có)"
            value={formData.note}
            onChange={e => setFormData({ ...formData, note: e.target.value })}
            disabled={isSubmitting}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? 'Đang xử lý...'
              : shiftbyidResp
              ? 'Cập nhật'
              : 'Thêm mới'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
