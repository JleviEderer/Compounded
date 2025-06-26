import React from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { HabitLogState } from '../types';

interface HeatMapGridProps {
  logs: Array<{
    date: string;
    state: HabitLogState;
  }>;
  onCellClick?: (date: string) => void;
}

export function HeatMapGrid({ logs, onCellClick }: HeatMapGridProps) {
  // Generate last 14 days
  const today = new Date();
  const startDate = addDays(today, -13);

  const days = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(startDate, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = logs.find(l => l.date === dateStr);

    return {
      date: dateStr,
      displayDate: format(date, 'M/d'),
      dayOfWeek: format(date, 'EEE'),
      state: log?.state || HabitLogState.UNLOGGED
    };
  });

  const getCellColor = (state: HabitLogState) => {
    switch (state) {
      case HabitLogState.GOOD:
        return 'bg-green-500';
      case HabitLogState.BAD:
        return 'bg-red-500';
      case HabitLogState.UNLOGGED:
        return 'bg-gray-200 dark:bg-gray-700';
      default:
        return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-14 gap-1">
        {days.map((day) => (
          <div key={day.date} className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {day.dayOfWeek}
            </div>
            <button
              onClick={() => onCellClick?.(day.date)}
              className={`
                min-w-[44px] min-h-[44px] w-full h-12 rounded-sm transition-all duration-200 cursor-pointer
                active:scale-95 active:ring-2 active:ring-coral/50
                touch-manipulation
                ${getCellColor(day.state)}
              `}
              title={`${day.displayDate}: ${day.state}`}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {day.displayDate}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}