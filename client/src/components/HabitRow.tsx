import { useState, useEffect } from 'react';
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

  // Close popover when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Don't close if clicking on the popover itself
      const target = event.target as Element;
      if (target?.closest('[data-radix-popper-content-wrapper]')) {
        return;
      }
      setShowPopover(false);
    };

    if (showPopover) {
      // Small delay to prevent immediate closing from the same touch that opened it
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [showPopover]);

  const today = new Date().toLocaleDateString('en-CA');
  const todayLog = logs.find(log => log.habitId === habit.id && log.date === today);

  const isTextTruncated = habit.goodHabit.length > 25;

  // Get last 7 days for expanded view
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-CA');
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
        return <Check className="w-3 h-3 text-white" />;
      default:
        return null;
    }
  };

  const getDayColor = (state: HabitLogState, isToday: boolean) => {
    switch (state) {
      case HabitLogState.GOOD:
        return isToday ? 'bg-coral border-2 border-coral-light' : 'bg-emerald-500';
      default:
        return isToday ? 'bg-gray-400 border-2 border-gray-300' : 'bg-gray-600/30 border border-gray-500';
    }
  };

  const getFrequencyDisplay = () => {
    if (habit.targetCount && habit.targetUnit) {
      const unit = habit.targetUnit === 'week' ? 'week' : 
                   habit.targetUnit === 'month' ? 'month' : 'year';
      return `${habit.targetCount} times/${unit}`;
    }
    return 'Daily tracking';
  };

  const getCompletionStatus = () => {
    if (todayLog?.state === HabitLogState.GOOD) {
      return { label: 'Completed', color: 'text-emerald-500' };
    }
    return { label: 'Pending', color: 'text-gray-400' };
  };

  const status = getCompletionStatus();

  return (
    <motion.div 
      className="bg-white/5 dark:bg-gray-800/30 rounded-xl border border-white/10 p-5 transition-all duration-300 hover:bg-white/8 hover:border-white/20"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        {/* Left side: Checkbox + Content */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Completion Button */}
          <button
            onClick={handleGoodHabit}
            className={cn(
              "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
              todayLog?.state === 'good' 
                ? "bg-emerald-500 border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600" 
                : "border-gray-400 hover:border-emerald-400 hover:bg-emerald-50/10"
            )}
            aria-label={`Mark ${habit.goodHabit} as ${todayLog?.state === 'good' ? 'incomplete' : 'completed'}`}
          >
            {todayLog?.state === 'good' && <Check className="w-3 h-3 text-white" />}
          </button>

          {/* Habit Info */}
          <div className="flex-1 min-w-0">
            <Popover open={showPopover} onOpenChange={setShowPopover}>
              <PopoverTrigger asChild>
                <div 
                  className={cn(
                    "font-medium text-lg leading-tight cursor-default transition-colors",
                    todayLog?.state === HabitLogState.GOOD 
                      ? 'text-emerald-400' 
                      : 'text-gray-100'
                  )}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                  {...(isMobile && isTextTruncated ? longPressHandlers : {})}
                >
                  {habit.goodHabit}
                </div>
              </PopoverTrigger>
              {isTextTruncated && (
                <PopoverContent className="w-48 p-2 text-xs" side="top" align="start" sideOffset={4}>
                  <div className="font-normal text-gray-700 dark:text-gray-300 leading-tight">
                    {habit.goodHabit}
                  </div>
                </PopoverContent>
              )}
            </Popover>

            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-400">
                {getFrequencyDisplay()}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-300">
                +{(habit.weight * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Status + Expand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className={cn("text-sm font-medium", status.color)}>
              {status.label}
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Expanded Week View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-6 pt-4 border-t border-gray-700/50">
              <h4 className="text-sm font-medium text-gray-300 mb-4">This Week's Progress</h4>
              <div className="grid grid-cols-7 gap-2">
                {getLast7Days().map((day, index) => (
                  <div key={day.date} className="text-center">
                    <div className={cn(
                      "text-xs mb-2 font-medium",
                      day.isToday ? 'text-coral' : 'text-gray-400'
                    )}>
                      {day.label}
                    </div>
                    <motion.div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all",
                        getDayColor(day.state, day.isToday)
                      )}
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