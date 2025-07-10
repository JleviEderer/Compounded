import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLongPress } from '../hooks/useLongPress';

interface HabitRowWithLongPressProps {
  habit: any;
  habitIndex: number;
  filteredLogs: any[];
  getLast7Days: () => any[];
  popoverHabit: { id: string; name: string } | null;
  setPopoverHabit: (habit: { id: string; name: string } | null) => void;
}

const HabitRowWithLongPress: React.FC<HabitRowWithLongPressProps> = ({
  habit,
  habitIndex,
  filteredLogs,
  getLast7Days,
  popoverHabit,
  setPopoverHabit
}) => {
  const longPressHandlers = useLongPress({
    onLongPress: () => setPopoverHabit({ id: habit.id, name: habit.goodHabit }),
    delay: 300
  });

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <Popover
        open={popoverHabit?.id === habit.id}
        onOpenChange={(open) => !open && setPopoverHabit(null)}
      >
        <PopoverTrigger asChild>
          <motion.div
            className="p-3 font-medium text-gray-800 dark:text-white truncate whitespace-nowrap text-left cursor-default sm:cursor-auto"
            style={{
              width: Math.min(Math.max(habit.goodHabit.length * 8 + 24, 80), 140) + 'px'
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: habitIndex * 0.1 }}
            {...(isMobile ? longPressHandlers : {})}
          >
            {habit.goodHabit}
          </motion.div>
        </PopoverTrigger>
        <PopoverContent
          className="w-64 p-3 text-sm sm:hidden"
          side="right"
          align="start"
        >
          <div className="font-medium text-gray-800 dark:text-white">
            {habit.goodHabit}
          </div>
        </PopoverContent>
      </Popover>

      {getLast7Days().map((day, dayIndex) => {
        const log = filteredLogs.find(
          (l) => l.habitId === habit.id && l.date === day.date
        );

        const squareStyle =
          log?.state === 'good'
            ? 'bg-teal-500'
            : log?.state === 'bad'
            ? 'bg-red-400'
            : 'bg-gray-200 dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-500';

        return (
          <div key={day.date} className="p-3 flex items-center justify-center">
            <motion.div
              className={`w-5 h-5 rounded ${squareStyle}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: habitIndex * 0.1 + dayIndex * 0.02
              }}
            />
          </div>
        );
      })}
    </>
  );
};

interface InsightsWeekViewProps {
  habits: any[];
  filteredLogs: any[];
  weekAnchor: Date;
  isCurrentWeek: () => boolean;
  getWeekLabel: () => string;
  navigateWeek: (direction: 'prev' | 'next') => void;
  setWeekAnchor: (date: Date) => void;
  popoverHabit: { id: string; name: string } | null;
  setPopoverHabit: (habit: { id: string; name: string } | null) => void;
}

export const InsightsWeekView: React.FC<InsightsWeekViewProps> = ({
  habits,
  filteredLogs,
  weekAnchor,
  isCurrentWeek,
  getWeekLabel,
  navigateWeek,
  setWeekAnchor,
  popoverHabit,
  setPopoverHabit
}) => {
  const getLast7Days = () => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const offset = (weekAnchor.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(weekAnchor);
    monday.setDate(weekAnchor.getDate() - offset);

    return [...Array(7)].map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        date: d.toLocaleDateString('en-CA'),
        label: labels[i]
      };
    });
  };

  if (typeof window !== 'undefined') {
    (window as any).getLast7Days ??= getLast7Days;
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {getWeekLabel()}
        </h3>
        <div className="flex space-x-2">
          {!isCurrentWeek() && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setWeekAnchor(new Date())}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Current Week
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('prev')}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('next')}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        {/* 8-column grid: auto-sized habit + 7 × 44-px day cells */}
        <div className="grid grid-cols-[auto_repeat(7,44px)] gap-y-3"></div>
          {/* header row */}
          <div className="text-left text-sm font-medium text-gray-600 dark:text-gray-400 p-3">
            Habit
          </div>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
            <div
              key={label}
              className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 p-3"
            >
              {label}
            </div>
          ))}

          {/* habit rows (each outputs exactly 8 cells) */}
          <div className="contents">
            {habits.map((habit, idx) => (
              <HabitRowWithLongPress
                key={habit.id}
                habit={habit}
                habitIndex={idx}
                filteredLogs={filteredLogs}
                getLast7Days={getLast7Days}
                popoverHabit={popoverHabit}
                setPopoverHabit={setPopoverHabit}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};