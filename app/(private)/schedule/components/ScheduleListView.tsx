import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Shift } from "@/features/schedule/types";

interface ScheduleListViewProps {
  formattedSchedule: { [dayOfWeek: string]: { time: string; shifts: Shift[] }[] };
  handleOpenDialog: (shift: Shift) => void;
  handleDelete: (id: number) => void;
}

export default function ScheduleListView({ formattedSchedule, handleOpenDialog, handleDelete }: ScheduleListViewProps) {
  const daysOfWeek = Object.keys(formattedSchedule); 

  return (
    <div className="grid gap-4">
      {daysOfWeek.map((day) => (
        <Card key={day} className="shadow-md">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg">{day}</span>
             {/* // <Button variant="ghost" size="sm" onClick={() => handleOpenDialog()} className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span>Thêm</span>
              </Button> */}
            </div>

            {formattedSchedule[day]?.length > 0 ? (
              formattedSchedule[day].map((slot, index) => (
                <div key={index} className="p-3 border rounded-lg mb-2 bg-gray-100">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">{slot.time}</span>
                    <div className="flex gap-2">
                      {/* <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(slot.shifts[0], day)}>
                        <Edit className="h-4 w-4" />
                      </Button> */}
                    {/* <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(slot.shifts[0].id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button> */}
                    </div>
                  </div>
                  {slot.shifts.map((shift) => (
                    <div key={shift.id} className="mt-2">
                      <p className="text-sm font-medium">{shift.detail.note}</p>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm text-center p-3">Không có lịch làm việc</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
