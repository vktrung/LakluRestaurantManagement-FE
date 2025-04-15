'use client';

import { useState, useEffect } from 'react';
import ScheduleHeader from './ScheduleHeader';
import ScheduleNavigation from './ScheduleNavigation';
import ScheduleActions from './ScheduleActions';
import ScheduleWeekView from './ScheduleWeekView';
import ScheduleListView from './ScheduleListView';
import { useSchedule } from './useSchedule';
import { addWeeks, subWeeks } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventForm from './EventForm';
import {
  AddShiftRequest,
  UpdateShiftRequest,
  Shift,
} from '@/features/schedule/types';

export default function Timetable() {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().getMonth() + 1 + '',
  );
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [selectedShiftId, setSelectedShiftId] = useState<number | undefined>(
    undefined,
  );
  const [hasQrCodePermission, setHasQrCodePermission] =
    useState<boolean>(false);
  const [formError, setFormError] = useState<any>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const goToPreviousWeek = () => setCurrentDate(prev => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));

  const {
    formattedSchedule,
    formattedStaffSchedule, // Dữ liệu cho ScheduleListView
    handleOpenAddDialog,
    handleOpenUpdateDialog,
    handleDelete,
    isDialogOpen,
    isUpdateDialogOpen,
    setIsDialogOpen,
    setIsUpdateDialogOpen,
    selectedShiftResponse,
    handleSubmit,
    handleGetQrCode,
    handleGetQrCodeCheckout,
    userMeData, // Dùng để thay đổi staffId nếu cần
    isLoadingUserMe, // Trạng thái tải thông tin người dùng
    userMeError, // Lỗi nếu có
  } = useSchedule(currentDate);

  // Check if user has required permission when user data loads
  useEffect(() => {
    if (userMeData && userMeData.data) {
      const hasPermission = userMeData.data.permissions.includes(
        'schedules:create_check_in_qr_code',
      );
      setHasQrCodePermission(hasPermission);
      // If user doesn't have permission, force to list view
      if (!hasPermission && viewMode === 'week') {
        setViewMode('list');
      }
    }
  }, [userMeData, viewMode]);

  const handleOpenUpdateDialogWithId = (shift: Shift) => {
    setSelectedShiftId(shift.id);
    handleOpenUpdateDialog(shift);
  };

  const wrappedHandleSubmit = async (
    formData: AddShiftRequest | UpdateShiftRequest,
  ): Promise<void> => {
    console.log('Selected Shift ID in Timetable:', selectedShiftId);
    try {
      const response = await handleSubmit(formData, selectedShiftId);

      // Store response for passing to EventForm
      setApiResponse(response);

      // Check if response is successful
      if (response.httpStatus === 200) {
        // Chỉ đóng form khi không có lỗi
        if (isDialogOpen) setIsDialogOpen(false);
        if (isUpdateDialogOpen) setIsUpdateDialogOpen(false);

        // Xóa lỗi nếu có
        setFormError(null);
      } else {
        // If response has an error object with specific error messages
        if (response.error && typeof response.error === 'object') {
          // Get first error message from error object
          const errorKeys = Object.keys(response.error);
          if (errorKeys.length > 0) {
            const firstErrorKey = errorKeys[0];
            setFormError(response.error[firstErrorKey]);
            throw response.error[firstErrorKey];
          }
        }

        // If no specific error message found, use the general message
        const errorMessage = response.message || 'Đã xảy ra lỗi khi lưu ca làm';
        setFormError(errorMessage);
        throw errorMessage;
      }
    } catch (error: any) {
      console.error('Lỗi khi lưu ca làm:', error);

      // Nếu error là object với error.error object (nested error)
      if (
        error &&
        typeof error === 'object' &&
        error.error &&
        typeof error.error === 'object'
      ) {
        const errorKeys = Object.keys(error.error);
        if (errorKeys.length > 0) {
          // Prioritize manager error if it exists
          if (error.error.manager) {
            setFormError(error.error.manager);
          } else {
            setFormError(error.error[errorKeys[0]]);
          }
        } else {
          setFormError(error.message || 'Đã xảy ra lỗi khi lưu ca làm');
        }
      }
      // Nếu error là object với httpStatus
      else if (error && typeof error === 'object' && error.httpStatus) {
        if (error.error && typeof error.error === 'object') {
          // Check for nested error messages
          const errorKeys = Object.keys(error.error);
          if (errorKeys.length > 0) {
            setFormError(error.error[errorKeys[0]]);
          } else {
            setFormError(error.message || 'Đã xảy ra lỗi khi lưu ca làm');
          }
        } else {
          setFormError(error.message || 'Đã xảy ra lỗi khi lưu ca làm');
        }
      }
      // Nếu error là string
      else if (typeof error === 'string') {
        setFormError(error);
      }
      // Mặc định
      else {
        setFormError('Đã xảy ra lỗi khi lưu ca làm');
      }

      // Không đóng form, để hiển thị lỗi
      throw error;
    }
  };

  // Hiển thị trạng thái tải hoặc lỗi khi lấy thông tin người dùng
  if (isLoadingUserMe) {
    return (
      <div className="text-center py-10">Đang tải thông tin người dùng...</div>
    );
  }

  if (userMeError) {
    return (
      <div className="text-center py-10 text-red-600">
        Lỗi khi lấy thông tin người dùng:{' '}
        {(userMeError as any)?.data?.message || 'Không xác định'}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <ScheduleHeader
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        currentDate={currentDate}
      />

      <ScheduleNavigation
        goToPreviousWeek={goToPreviousWeek}
        goToNextWeek={goToNextWeek}
      />

      {hasQrCodePermission && (
        <ScheduleActions handleOpenAddDialog={handleOpenAddDialog} />
      )}

      <Tabs
        value={viewMode}
        onValueChange={val => {
          // Only allow changing to week view if user has permission
          if (val === 'week' && !hasQrCodePermission) {
            return;
          }
          setViewMode(val as 'week' | 'list');
        }}
        className="w-full"
      >
        <TabsList className="mb-4">
          {hasQrCodePermission ? (
            <>
              <TabsTrigger value="week">Tuần</TabsTrigger>
              <TabsTrigger value="list">Danh sách</TabsTrigger>
            </>
          ) : (
            <TabsTrigger value="list">Danh sách</TabsTrigger>
          )}
        </TabsList>

        {hasQrCodePermission && (
          <TabsContent value="week">
            <ScheduleWeekView
              handleGetQrCode={handleGetQrCode}
              handleGetQrCodeCheckout={handleGetQrCodeCheckout}
              formattedSchedule={formattedSchedule}
              handleOpenDialog={handleOpenUpdateDialogWithId}
              handleDelete={handleDelete}
            />
          </TabsContent>
        )}

        <TabsContent value="list">
          <ScheduleListView
            formattedStaffSchedule={formattedStaffSchedule}
            handleOpenDialog={
              hasQrCodePermission ? handleOpenUpdateDialogWithId : () => {}
            }
            handleDelete={hasQrCodePermission ? handleDelete : () => {}}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog for Add Shift */}
      {isDialogOpen && hasQrCodePermission && (
        <EventForm
          onClose={() => setIsDialogOpen(false)}
          currentDate={currentDate}
          handleSubmit={wrappedHandleSubmit}
          formError={formError}
          apiResponse={apiResponse}
        />
      )}

      {isUpdateDialogOpen && selectedShiftResponse && hasQrCodePermission && (
        <EventForm
          shiftbyidResp={selectedShiftResponse}
          onClose={() => setIsUpdateDialogOpen(false)}
          currentDate={currentDate}
          handleSubmit={wrappedHandleSubmit}
          formError={formError}
          apiResponse={apiResponse}
        />
      )}
    </div>
  );
}
