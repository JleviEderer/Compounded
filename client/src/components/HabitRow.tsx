import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X, Minus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HabitPair, HabitLog, HabitLogState, WEIGHT_LABELS } from '../types';
import { cn } from '../lib/utils';
import { useHabitsContext as useHabits } from '../contexts/HabitsContext';
import { useLongPress } from '../hooks/useLongPress';

interface HabitRowProps {
  habit: HabitPair;
  logs: HabitLog[];
  onLogHabit: (habitId: string, date: string, state: HabitLogState) => void;
  isToday?: boolean;
  showSavedFlash?: boolean;
}

export default function HabitRow({ habit, logs, onLogHabit, isToday = false, showSavedFlash = false }: HabitRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and window resize
  useState(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });

  const longPressHandlers = useLongPress({
    onLongPress: () => setShowPopover(true),
    delay: 500
  });

  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
  const todayLog = logs.find(log => log.habitId === habit.id && log.date === today);

  // Check if text is truncated
  const isTextTruncated = habit.goodHabit.length > 25; // Approximate truncation point

  // Get last 7 days for expanded view
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
      const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);

      days.push({
        date: dateStr,
        label: i === 0 ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' }),
        state: log?.state || HabitLogState.UNLOGGED,
        isToday: i === 0
      });
    }
    return days;
  };

  const handleGoodHabit = () => {
    const newState = todayLog?.state === HabitLogState.GOOD ? HabitLogState.UNLOGGED : HabitLogState.GOOD;
    onLogHabit(habit.id, today, newState);
  };

  const getDayIcon = (state: HabitLogState) => {
    switch (state) {
      case HabitLogState.GOOD:
        return <Check className="w-4 h-4 text-white" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDayColor = (state: HabitLogState) => {
    switch (state) {
      case HabitLogState.GOOD:
        return 'bg-emerald-500';
      default:
        return 'bg-gray-300 dark:bg-gray-600';
    }
  };

  return (
    <motion.div 
      className="card-glass p-4 transition-all duration-300 hover:shadow-lg relative"
      layout
      initial={{ opacity: 0, y: window.innerWidth < 768 ? 5 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.1 : 0.3 
      }}
    >
      <div className="flex items-start justify-between min-w-0 gap-3">
        <div className="flex items-start space-x-3 min-w-0 flex-1">
          <div className="flex-shrink-0 mt-1">
            <button
              onClick={handleGoodHabit}
              className={cn(
                "p-2 rounded-full transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center",
                todayLog?.state === 'good' 
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
                  : "hover:bg-emerald-50 text-gray-400 dark:hover:bg-emerald-900/20 dark:text-gray-500 active:bg-emerald-100 dark:active:bg-emerald-900/30"
              )}
              aria-label={`Mark ${habit.goodHabit} as ${todayLog?.state === 'good' ? 'incomplete' : 'completed'}`}
            >
              <Check className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 min-w-0 py-1">
            <Popover
              open={showPopover}
              onOpenChange={setShowPopover}
            >
              <PopoverTrigger asChild>
                <div 
                  className={`font-semibold text-gray-800 dark:text-white relative cursor-default
                    ${todayLog?.state === HabitLogState.GOOD ? 'text-emerald-600' : ''}
                    ${isTextTruncated ? 'line-clamp-2' : ''}`}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.3',
                    maxHeight: '2.6em'
                  }}
                  {...(isMobile && isTextTruncated ? longPressHandlers : {})}
                >
                  {habit.goodHabit}
                </div>
              </PopoverTrigger>
              {isTextTruncated && (
                <PopoverContent
                  className="w-48 p-2 text-xs"
                  side="top"
                  align="start"
                  sideOffset={4}
                >
                  <div className="font-normal text-gray-700 dark:text-gray-300 leading-tight">
                    {habit.goodHabit}
                  </div>
                </PopoverContent>
              )}
            </Popover>

            <div className="text-xs text-gray-500 mt-1 leading-tight">
              {habit.targetCount && habit.targetUnit ? (
                `${habit.targetCount} × / ${habit.targetUnit === 'week' ? 'wk' : habit.targetUnit === 'month' ? 'mo' : 'yr'}`
              ) : (
                'Track daily progress'
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2 flex-shrink-0 mt-1">
          <div className="text-right min-w-[70px]">
            {todayLog?.state === HabitLogState.GOOD && (
              <div className="text-sm font-medium text-emerald-600 whitespace-nowrap leading-tight">
                Completed
              </div>
            )}
            {todayLog?.state === HabitLogState.UNLOGGED && (
              <div className="text-sm font-medium text-gray-400 whitespace-nowrap leading-tight">
                Not logged
              </div>
            )}
            <div className="text-xs text-gray-500 whitespace-nowrap leading-tight mt-0.5">
              {WEIGHT_LABELS[habit.weight]?.split(' ')[0] || 'Unknown'} impact
            </div>
          </div>
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-600 rounded-lg transition-colors flex-shrink-0"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 px-2 pr-4">
              <div className="grid grid-cols-7 gap-3">
                {getLast7Days().map((day, index) => (
                  <div key={day.date} className="text-center">
                    <div className={`text-xs mb-2 ${
                      day.isToday ? 'text-coral font-medium' : 'text-gray-500'
                    }`}>
                      {day.label}
                    </div>
                    <motion.div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto ${
                        getDayColor(day.state)
                      } ${day.isToday && day.state !== HabitLogState.UNLOGGED ? 'ring-2 ring-coral ring-offset-2' : ''}`}
                      whileHover={{ scale: 1.1 }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {getDayIcon(day.state)}
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}