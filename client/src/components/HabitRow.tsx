import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X, Minus } from 'lucide-react';
import { HabitPair, HabitLog, HabitLogState, WEIGHT_LABELS } from '../types';

interface HabitRowProps {
  habit: HabitPair;
  logs: HabitLog[];
  onLogHabit: (habitId: string, date: string, state: HabitLogState) => void;
  isToday?: boolean;
  showSavedFlash?: boolean;
}

export default function HabitRow({ habit, logs, onLogHabit, isToday = false, showSavedFlash = false }: HabitRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
  const todayLog = logs.find(log => log.habitId === habit.id && log.date === today);

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

  const handleBadHabit = () => {
    const newState = todayLog?.state === HabitLogState.BAD ? HabitLogState.UNLOGGED : HabitLogState.BAD;
    onLogHabit(habit.id, today, newState);
  };

  const getDayIcon = (state: HabitLogState) => {
    switch (state) {
      case HabitLogState.GOOD:
        return <Check className="w-4 h-4 text-white" />;
      case HabitLogState.BAD:
        return <X className="w-4 h-4 text-white" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDayColor = (state: HabitLogState) => {
    switch (state) {
      case HabitLogState.GOOD:
        return 'bg-emerald-500';
      case HabitLogState.BAD:
        return 'bg-red-500';
      default:
        return 'bg-gray-300 dark:bg-gray-600';
    }
  };

  return (
    <motion.div 
      className="card-glass p-6 transition-all duration-300 hover:shadow-lg relative"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            {/* Good Habit Button */}
            <motion.button
              onClick={handleGoodHabit}
              whileTap={{ scale: 0.9 }}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                todayLog?.state === HabitLogState.GOOD
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              }`}
            >
              <Check className={`w-5 h-5 ${
                todayLog?.state === HabitLogState.GOOD ? 'text-white' : 'text-emerald-500'
              }`} />
            </motion.button>

            {/* Bad Habit Button */}
            <motion.button
              onClick={handleBadHabit}
              whileTap={{ scale: 0.9 }}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                todayLog?.state === HabitLogState.BAD
                  ? 'bg-red-500 border-red-500'
                  : 'border-red-300 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              <X className={`w-5 h-5 ${
                todayLog?.state === HabitLogState.BAD ? 'text-white' : 'text-red-500'
              }`} />
            </motion.button>

            <div>
              <div className={`font-semibold text-gray-800 dark:text-white relative ${
                todayLog?.state === HabitLogState.GOOD ? 'text-emerald-600' : 
                todayLog?.state === HabitLogState.BAD ? 'text-red-600 line-through' : ''
              }`}>
                {habit.goodHabit}
                <Check 
                  className={`absolute -right-6 w-5 h-5 text-emerald-500 transition-opacity duration-800 ${
                    showSavedFlash ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
              <div className={`text-sm text-gray-500 ${
                todayLog?.state === HabitLogState.BAD ? 'text-red-500 font-medium' : 
                todayLog?.state === HabitLogState.GOOD ? 'line-through' : ''
              }`}>
                {habit.badHabit}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            {todayLog?.state === HabitLogState.GOOD && (
              <div className="text-sm font-medium text-emerald-600">
                +{(habit.weight * 100).toFixed(2)}%
              </div>
            )}
            {todayLog?.state === HabitLogState.BAD && (
              <div className="text-sm font-medium text-red-600">
                -{(habit.weight * 100).toFixed(2)}%
              </div>
            )}
            {todayLog?.state === HabitLogState.UNLOGGED && (
              <div className="text-sm font-medium text-gray-400">
                ±{(habit.weight * 100).toFixed(2)}%
              </div>
            )}
            <div className="text-xs text-gray-500">
              {WEIGHT_LABELS[habit.weight].split(' ')[0]} impact
            </div>
          </div>
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/50 dark:hover:bg-gray-600 rounded-lg transition-colors"
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
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-7 gap-2">
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