"use client"
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScheduleNavigationProps {
  goToPreviousWeek: () => void; 
  goToNextWeek: () => void;
}

export default function ScheduleNavigation({ goToPreviousWeek, goToNextWeek }: ScheduleNavigationProps) {
  return (
    <div className="flex justify-between my-4">
      <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
        <ChevronLeft className="h-4 w-4 mr-1" />
        Tuần trước
      </Button>
      <Button variant="outline" size="sm" onClick={goToNextWeek}>
        Tuần sau
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
