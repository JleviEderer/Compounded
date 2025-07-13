import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HabitRowWithLongPress } from './HabitRowWithLongPress';

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
      className="space-y-4 flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between flex-wrap gap-y-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate min-w-0 flex-1 pr-2">
          {getWeekLabel()}
        </h3>
        <div className="flex space-x-1">
          {!isCurrentWeek() && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setWeekAnchor(new Date())}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Current
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

      <div className="w-full overflow-hidden flex-1 min-h-0">
        {/* Optimized grid for better balance and vertical space usage */}
        <div
          className="
            grid gap-y-1 w-full h-full content-start
            sm:grid-cols-[120px_repeat(7,minmax(40px,1fr))]
            grid-cols-[100px_repeat(7,minmax(35px,1fr))]
          ">
          {/* header row */}
          <div className="text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 py-3 px-2 flex items-center">
            Habits
          </div>
          {/* Day headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(full => {
            const short = full[0]
            return (
              <div
                key={full}
                title={full}
                className="text-center font-medium text-gray-600 dark:text-gray-400 py-3 px-1
                           text-xs sm:text-sm flex items-center justify-center min-w-0"
              >
                <span className="block sm:hidden">{short}</span>
                <span className="hidden sm:block truncate">{full}</span>
              </div>
            )
          })}

          {/* habit rows */}
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