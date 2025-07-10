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
  const [useEllipsis, setUseEllipsis] = React.useState(false);
  const labelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (labelRef.current) {
      // Check if scrollHeight is greater than clientHeight AND there are no spaces in the text
      if (labelRef.current.scrollHeight > labelRef.current.clientHeight && !habit.goodHabit.includes(' ')) {
        setUseEllipsis(true);
      } else {
        setUseEllipsis(false);
      }
    }
  }, [habit.goodHabit]);


  return (
    <React.Fragment>
      <Popover
        open={popoverHabit?.id === habit.id}
        onOpenChange={(open) => !open && setPopoverHabit(null)}
      >
        <PopoverTrigger asChild>
          <motion.div
            ref={labelRef}
            className={`p-3 font-medium text-gray-800 dark:text-white text-left cursor-default sm:cursor-auto
                       text-sm overflow-hidden max-w-[100px] sm:max-w-[140px] ${
                         useEllipsis 
                           ? 'whitespace-nowrap truncate' 
                           : 'break-words whitespace-normal line-clamp-2'
                       }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: habitIndex * 0.1 }}
            {...(isMobile ? longPressHandlers : {})}
          >
            {habit.goodHabit}
          </motion.div>
        </PopoverTrigger>
        {/* show on long-press *or* hover if truncated */}
        <PopoverContent
          className="w-64 p-3 text-sm"
          side="right"
          align="start"
        >
          <div className="font-medium text-gray-800 dark:text-white">
            {habit.goodHabit}
          </div>
        </PopoverContent>
      </Popover>
      {getLast7Days().map((day, dayIndex) => {
        const log = filteredLogs.find(l => l.habitId === habit.id && l.date === day.date);

        const getSquareStyle = () => {
          if (log?.state === 'good') {
            return 'bg-teal-500'; // #10b981 - good habit completed
          } else if (log?.state === 'bad') {
            return 'bg-red-400'; // #f87171 (coral) - bad habit completed
          } else {
            return 'bg-gray-200 dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-500'; // #e5e7eb - not logged
          }
        };

        return (
          <div key={day.date} className="p-3 flex items-center justify-center">
            <motion.div 
              className={`w-5 h-5 rounded ${getSquareStyle()}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: habitIndex * 0.1 + dayIndex * 0.02 }}
            />
          </div>
        );
      })}
    </React.Fragment>
  );
};