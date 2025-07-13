import React, { useState, useRef, useEffect } from 'react';
import { useLongPress } from 'use-long-press';
import { CalendarDays, CheckCircle2, Circle, X } from 'lucide-react';

interface HabitRowProps {
  habit: any;
  habitIndex: number;
  filteredLogs: any[];
  getLast7Days: () => { date: string; label: string }[];
  popoverHabit: { id: string; name: string } | null;
  setPopoverHabit: (habit: { id: string; name: string } | null) => void;
}

export const HabitRowWithLongPress: React.FC<HabitRowProps> = ({
  habit,
  habitIndex,
  filteredLogs,
  getLast7Days,
  popoverHabit,
  setPopoverHabit
}) => {
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout>>();

  const getHabitStateForDate = (habitId: string, date: string) => {
    const log = filteredLogs.find(log => log.habitId === habitId && log.date === date);
    return log ? log.state : 'unlogged';
  };

  const onLongPress = () => {
    setIsLongPress(true);
    longPressTimeout.current = setTimeout(() => {
      setPopoverHabit({ id: habit.id, name: habit.name });
      setIsLongPress(false);
    }, 500);
  };

  const onClick = () => {
    if (isLongPress) {
      setIsLongPress(false);
      clearTimeout(longPressTimeout.current);
      return;
    }
    setPopoverHabit({ id: habit.id, name: habit.name });
  };

  const bind = useLongPress(onLongPress, {
    onClick,
    threshold: 500,
    onCancel: () => setIsLongPress(false)
  });

  return (
    <>
      <div
        key={habit.id}
        className="text-left font-medium text-gray-800 dark:text-gray-200 py-3 px-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer truncate"
        {...bind()}
      >
        {habit.name}
      </div>

      {getLast7Days().map(day => {
        const habitState = getHabitStateForDate(habit.id, day.date);
        const isLogged = habitState !== 'unlogged';
        const isGood = habitState === 'good';

        let bgColor = 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-500'; // unlogged
        if (isLogged) {
          bgColor = isGood ? 'bg-emerald-500' : 'bg-rose-500';
        }

        return (
          <div
            key={`${habit.id}-${day.date}`}
            className={`
              ${bgColor}
              w-full h-full flex items-center justify-center
              rounded-sm shadow-sm
              hover:opacity-80 transition-opacity
              cursor-pointer
            `}
            onClick={() => setPopoverHabit({ id: habit.id, name: habit.name })}
          >
            {isLogged && isGood && <CheckCircle2 className="w-4 h-4 text-white" />}
            {isLogged && !isGood && <X className="w-4 h-4 text-white" />}
            {!isLogged && <Circle className="w-4 h-4 text-gray-400 dark:text-gray-600" />}
          </div>
        );
      })}
    </>
  );
};