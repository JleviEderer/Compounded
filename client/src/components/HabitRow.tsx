import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X, Minus } from 'lucide-react';
import { HabitPair, HabitLog, WEIGHT_LABELS } from '../types';
import { Checkbox } from '@/components/ui/checkbox';

interface HabitRowProps {
  habit: HabitPair;
  logs: HabitLog[];
  onToggle: (habitId: string, date: string) => void;
  isToday?: boolean;
}

export default function HabitRow({ habit, logs, onToggle, isToday = false }: HabitRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(log => log.habitId === habit.id && log.date === today);
  
  // Get last 7 days for expanded view
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
      
      days.push({
        date: dateStr,
        label: i === 0 ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' }),
        completed: log?.completed || false,
        isToday: i === 0
      });
    }
    return days;
  };

  const handleToggle = () => {
    onToggle(habit.id, today);
  };

  const getDayIcon = (completed: boolean) => {
    if (completed) return <Check className="w-4 h-4 text-white" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getDayColor = (completed: boolean) => {
    return completed 
      ? 'bg-emerald-500' 
      : 'bg-gray-300 dark:bg-gray-600';
  };

  return (
    <motion.div 
      className="card-glass p-6 transition-all duration-300 hover:shadow-lg"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <motion.div
              whileTap={{ scale: 0.9 }}
            >
              <Checkbox
                checked={todayLog?.completed || false}
                onCheckedChange={handleToggle}
                className="w-5 h-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
            </motion.div>
            <div>
              <div className={`font-semibold text-gray-800 dark:text-white ${
                todayLog?.completed ? '' : ''
              }`}>
                {habit.goodHabit} instead of
              </div>
              <div className={`text-sm text-gray-500 ${
                todayLog?.completed ? 'line-through' : ''
              }`}>
                {habit.badHabit}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-medium text-coral">
              +{(habit.weight * 100).toFixed(2)}%
            </div>
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
                        getDayColor(day.completed)
                      } ${day.isToday && day.completed ? 'ring-2 ring-coral ring-offset-2' : ''}`}
                      whileHover={{ scale: 1.1 }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {getDayIcon(day.completed)}
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
