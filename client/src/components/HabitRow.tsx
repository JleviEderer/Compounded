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
        return 'bg-emerald-500 hover:bg-emerald-600';
      default:
        return 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500';
    }
  };

  return (
    <motion.div 
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-0.5 relative group"
      layout
      initial={{ opacity: 0, y: window.innerWidth < 768 ? 5 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.1 : 0.3 
      }}
    >
      <div className="flex items-start justify-between min-w-0 gap-4">
        <div className="flex items-start space-x-4 min-w-0 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            <button
              onClick={handleGoodHabit}
              className={cn(
                "p-3 rounded-full transition-all duration-200 min-h-[48px] min-w-[48px] flex items-center justify-center shadow-sm hover:shadow-md",
                todayLog?.state === 'good' 
                  ? "bg-emerald-500 text-white ring-2 ring-emerald-200 dark:ring-emerald-700 scale-105" 
                  : "bg-gray-100 hover:bg-emerald-50 text-gray-400 hover:text-emerald-500 dark:bg-gray-700 dark:hover:bg-emerald-900/20 dark:text-gray-500 dark:hover:text-emerald-400"
              )}
              aria-label={`Mark ${habit.goodHabit} as ${todayLog?.state === 'good' ? 'incomplete' : 'completed'}`}
            >
              <Check className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 min-w-0 py-1">
            <Popover
              open={showPopover}
              onOpenChange={setShowPopover}
            >
              <PopoverTrigger asChild>
                <div 
                  className={`font-semibold text-lg text-gray-800 dark:text-white relative cursor-default leading-tight
                    ${todayLog?.state === HabitLogState.GOOD ? 'text-emerald-600 dark:text-emerald-400' : ''}
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

            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-tight">
              {habit.targetCount && habit.targetUnit ? (
                `${habit.targetCount} × / ${habit.targetUnit === 'week' ? 'wk' : habit.targetUnit === 'month' ? 'mo' : 'yr'}`
              ) : (
                'Track daily progress'
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-3 flex-shrink-0">
          <div className="text-right min-w-[80px]">
            {todayLog?.state === HabitLogState.GOOD && (
              <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap leading-tight">
                Completed
              </div>
            )}
            {todayLog?.state === HabitLogState.UNLOGGED && (
              <div className="text-sm font-medium text-gray-400 whitespace-nowrap leading-tight">
                Not logged
              </div>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap leading-tight mt-1 flex items-center gap-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                habit.weight >= 0.5 ? "bg-amber-400" : 
                habit.weight >= 0.25 ? "bg-blue-400" : "bg-gray-400"
              )}></div>
              {WEIGHT_LABELS[habit.weight]?.split(' ')[0] || 'Unknown'} impact
            </div>
          </div>
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/60 dark:hover:bg-gray-600/60 rounded-lg transition-colors flex-shrink-0 group-hover:bg-white/40 dark:group-hover:bg-gray-600/40"
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
            <div className="mt-5 pt-5 border-t border-gray-200/60 dark:border-gray-600/60 px-1">
              <div className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                Last 7 Days
              </div>
              <div className="grid grid-cols-7 gap-4">
                {getLast7Days().map((day, index) => (
                  <div key={day.date} className="text-center">
                    <div className={`text-xs mb-3 font-medium ${
                      day.isToday ? 'text-coral' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {day.label}
                    </div>
                    <motion.div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto shadow-sm ${
                        getDayColor(day.state)
                      } ${day.isToday && day.state !== HabitLogState.UNLOGGED ? 'ring-2 ring-coral ring-offset-2 dark:ring-offset-gray-800' : ''}`}
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