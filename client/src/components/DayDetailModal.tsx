import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { HabitLogState, HabitLog } from '../types';
import { Button } from './ui/button';

interface DayDetailModalProps {
  date: string; // ISO date string (YYYY-MM-DD)
  onClose: () => void;
  filteredLogs?: HabitLog[]; // Use filtered logs if provided
}

export default function DayDetailModal({ date, onClose, filteredLogs }: DayDetailModalProps) {
  const { habits, logs: allLogs, logHabit } = useHabits();
  
  // Use filtered logs if provided, otherwise use all logs
  const logs = filteredLogs || allLogs;

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getDayLogs = () => {
    return habits.map(habit => {
      const log = logs.find(l => l.habitId === habit.id && l.date === date);
      return {
        habit,
        log,
        state: log?.state || HabitLogState.UNLOGGED
      };
    });
  };

  const handleStateChange = (habitId: string, newState: HabitLogState) => {
    logHabit(habitId, date, newState);
  };

  const dayLogs = getDayLogs();

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {formatDate(date)}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Habits List */}
        <div className="space-y-4">
          {dayLogs.map(({ habit, state }) => (
            <motion.div
              key={habit.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-800 dark:text-white">
                  {habit.goodHabit}
                </h3>
                <div className="flex gap-2">
                  {/* Good Habit Button */}
                  <motion.button
                    onClick={() => 
                      handleStateChange(
                        habit.id, 
                        state === HabitLogState.GOOD ? HabitLogState.UNLOGGED : HabitLogState.GOOD
                      )
                    }
                    whileTap={{ scale: 0.9 }}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      state === HabitLogState.GOOD
                        ? 'bg-teal-500 border-teal-500'
                        : 'border-teal-300 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${
                      state === HabitLogState.GOOD ? 'text-white' : 'text-teal-500'
                    }`} />
                  </motion.button>

                  {/* Bad Habit Button */}
                  <motion.button
                    onClick={() => 
                      handleStateChange(
                        habit.id, 
                        state === HabitLogState.BAD ? HabitLogState.UNLOGGED : HabitLogState.BAD
                      )
                    }
                    whileTap={{ scale: 0.9 }}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      state === HabitLogState.BAD
                        ? 'bg-red-400 border-red-400'
                        : 'border-red-300 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                  >
                    <X className={`w-4 h-4 ${
                      state === HabitLogState.BAD ? 'text-white' : 'text-red-500'
                    }`} />
                  </motion.button>
                </div>
              </div>

              {/* Status */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {state === HabitLogState.GOOD && (
                  <span className="text-teal-600 dark:text-teal-400">✓ Good habit completed</span>
                )}
                {state === HabitLogState.BAD && (
                  <span className="text-red-500 dark:text-red-400">✗ Bad habit: {habit.badHabit}</span>
                )}
                {state === HabitLogState.UNLOGGED && (
                  <span className="text-gray-500 dark:text-gray-400">○ Not logged</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Good habits:</span>
              <span className="text-teal-600 font-medium">
                {dayLogs.filter(d => d.state === HabitLogState.GOOD).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Bad habits:</span>
              <span className="text-red-500 font-medium">
                {dayLogs.filter(d => d.state === HabitLogState.BAD).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Not logged:</span>
              <span className="text-gray-500 font-medium">
                {dayLogs.filter(d => d.state === HabitLogState.UNLOGGED).length}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}