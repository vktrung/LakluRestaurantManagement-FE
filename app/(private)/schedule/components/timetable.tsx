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
    await handleSubmit(formData, selectedShiftId);
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
        />
      )}

      {isUpdateDialogOpen && selectedShiftResponse && hasQrCodePermission && (
        <EventForm
          shiftbyidResp={selectedShiftResponse}
          onClose={() => setIsUpdateDialogOpen(false)}
          currentDate={currentDate}
          handleSubmit={wrappedHandleSubmit}
        />
      )}
    </div>
  );
}
