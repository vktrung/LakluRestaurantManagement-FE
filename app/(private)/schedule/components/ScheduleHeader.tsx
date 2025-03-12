import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { vi } from "date-fns/locale";

interface ScheduleHeaderProps {
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
  currentDate: Date; 
}

export default function ScheduleHeader({ selectedMonth, setSelectedMonth, currentDate }: ScheduleHeaderProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); 
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); 

  const formattedWeekStart = format(weekStart, "dd/MM/yyyy", { locale: vi });
  const formattedWeekEnd = format(weekEnd, "dd/MM/yyyy", { locale: vi });

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">Lịch làm việc</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Khoảng thời gian: {formattedWeekStart} - {formattedWeekEnd}
      </p>
      
     
    </div>
  );
}
