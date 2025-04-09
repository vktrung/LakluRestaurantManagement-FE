"use client"
import { Button } from "@/components/ui/button";
import { Plus, Copy } from "lucide-react";
import type { Shift } from '@/features/schedule/types';

interface ScheduleActionsProps {
  handleOpenAddDialog: (day?: string ) => void;
}

const DAYS_IN_WEEK = 7;

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
