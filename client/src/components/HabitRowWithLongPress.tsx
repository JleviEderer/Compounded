import React from 'react';
import { motion } from 'framer-motion';
import { useLongPress } from '../hooks/useLongPress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useHabitsContext as useHabits } from '../contexts/HabitsContext';

interface HabitRowWithLongPressProps {
  habit: any;
  habitIndex: number;
  filteredLogs: any[];
  getLast7Days: () => any[];
  popoverHabit: { id: string; name: string } | null;
  setPopoverHabit: (habit: { id: string; name: string } | null) => void;
}

export const HabitRowWithLongPress: React.FC<HabitRowWithLongPressProps> = ({
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

  // Natural text wrapping - let CSS handle it properly
  const displayText = habit.goodHabit;

  return (
    <>
      <Popover
        open={popoverHabit?.id === habit.id}
        onOpenChange={(open) => !open && setPopoverHabit(null)}
      >
        <PopoverTrigger asChild>
          <motion.div
            className="py-3 px-2 font-medium text-gray-800 dark:text-white text-left cursor-default sm:cursor-auto
                       text-sm leading-tight overflow-hidden
                       w-full h-12 flex items-start"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: habitIndex * 0.1 }}
            {...(isMobile ? longPressHandlers : {})}
          >
            {displayText}
          </motion.div>
        </PopoverTrigger>
        {/* Show popover on mobile long-press or hover for desktop */}
        <PopoverContent
          className="w-40 p-2 text-xs sm:hidden"
          side="right"
          align="start"
          sideOffset={4}
        >
          <div className="font-normal text-gray-700 dark:text-gray-300 leading-tight text-xs">
            {habit.goodHabit}
          </div>
        </PopoverContent>
      </Popover>

      {getLast7Days().map((day, dayIndex) => {
        const log = filteredLogs.find(l => l.habitId === habit.id && l.date === day.date);
        
        // Debug log to see what we're getting
        if (day.date === '2025-06-11' && habit.id === '1') {
          console.log('[HABIT ROW DEBUG]', {
            habitId: habit.id,
            date: day.date,
            log: log,
            logState: log?.state,
            logCompleted: log?.completed
          });
        }

        const getSquareStyle = () => {
          // Handle both 'state' and 'completed' properties for backward compatibility
          const isCompleted = log?.state === 'good' || log?.completed === true;
          const isBad = log?.state === 'bad';
          
          if (isCompleted) {
            return 'bg-teal-500'; // #14b8a6 - good habit completed
          } else if (isBad) {
            return 'bg-red-400'; // #f87171 (coral) - bad habit completed
          } else {
            return 'bg-gray-200 dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-500'; // #e5e7eb - not logged
          }
        };

        return (
          <div key={day.date} className="py-3 px-1 flex items-center justify-center min-w-0">
            <motion.div 
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded ${getSquareStyle()}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: habitIndex * 0.1 + dayIndex * 0.02 }}
            />
          </div>
        );
      })}
    </>
  );
};