'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  date: Date | undefined;
  setDate:
    | React.Dispatch<React.SetStateAction<Date>>
    | ((date: Date | undefined) => void);
  placeholder?: string;
  disabled?: boolean;
  showWeekNumber?: boolean;
  className?: string;
}

export function DatePicker({
  date,
  setDate,
  placeholder = 'Chọn ngày',
  disabled = false,
  showWeekNumber = false,
  className,
}: DatePickerProps) {
  const handleSelect = (newDate: Date | undefined) => {
    if (typeof setDate === 'function') {
      setDate(newDate as Date);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'dd/MM/yyyy') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          showWeekNumber={showWeekNumber}
        />
      </PopoverContent>
    </Popover>
  );
}
