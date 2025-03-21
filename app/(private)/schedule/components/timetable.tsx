'use client';

import { useState } from 'react';
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
    selectedStaffId, // Lấy staffId hiện tại
    setSelectedStaffId, // Dùng để thay đổi staffId nếu cần
    isLoadingUserMe, // Trạng thái tải thông tin người dùng
    userMeError, // Lỗi nếu có
  } = useSchedule(currentDate);

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
    return <div className="text-center py-10">Đang tải thông tin người dùng...</div>;
  }

  if (userMeError) {
    return <div className="text-center py-10 text-red-600">
      Lỗi khi lấy thông tin người dùng: {(userMeError as any)?.data?.message || 'Không xác định'}
    </div>;
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

      <ScheduleActions
        handleOpenAddDialog={handleOpenAddDialog}
  
      />

      <Tabs
        value={viewMode}
        onValueChange={val => setViewMode(val as 'week' | 'list')}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="week">Tuần</TabsTrigger>
          <TabsTrigger value="list">Danh sách</TabsTrigger>
        </TabsList>

        <TabsContent value="week">
          <ScheduleWeekView
            handleGetQrCode={handleGetQrCode}
            handleGetQrCodeCheckout={handleGetQrCodeCheckout}
            formattedSchedule={formattedSchedule}
            handleOpenDialog={handleOpenUpdateDialogWithId}
            handleDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="list">
          <ScheduleListView
            formattedStaffSchedule={formattedStaffSchedule} 
            handleOpenDialog={handleOpenUpdateDialogWithId}
            handleDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog for Add Shift */}
      {isDialogOpen && (
        <EventForm
          onClose={() => setIsDialogOpen(false)}
          currentDate={currentDate}
          handleSubmit={wrappedHandleSubmit}
        />
      )}

      {isUpdateDialogOpen && selectedShiftResponse && (
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