"use client"
import { Button } from "@/components/ui/button";
import { Plus, Copy } from "lucide-react";
import type { Shift } from '@/features/schedule/types';
import { daysInWeek } from "date-fns";

interface ScheduleActionsProps {
  handleOpenAddDialog: (day?: string ) => void;
}

export default function ScheduleActions({ handleOpenAddDialog }: ScheduleActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="sm" onClick={() => handleOpenAddDialog()}>
        <Plus className="h-4 w-4" />
        Thêm lịch làm việc
      </Button>
      <Button variant="outline" size="sm">
        <Copy className="h-4 w-4" />
        Sao chép lịch
      </Button>
    </div>
  );
}
