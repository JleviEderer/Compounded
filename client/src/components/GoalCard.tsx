
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit3, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Goal } from '@/types';
import { useGoalsContext } from '@/contexts/GoalsContext';
import { useHabits } from '@/hooks/useHabits';
import { GoalDialog } from './GoalDialog';
import { easeOutQuart } from '@/utils/motionConfig';
import { calculateAggregatedSuccessRate, calculateHabitSuccessRate, getFrequencyDisplayString } from '@/utils/frequencyHelpers';
import { useHabitsContext } from '@/contexts/HabitsContext';
import { TIME_WINDOWS, TimeWindowKey, getWindowRange, humanLabel } from '@/utils/timeWindows';
import { expectedForRange } from '@/utils/frequencyHelpers';
import { rateToColour, colourClass, SUCCESS_RATE_LEGEND } from '@/constants/successRate';

interface GoalCardProps {
  goal: Goal;
  isExpanded: boolean;
}

export function GoalCard({ goal, isExpanded }: GoalCardProps) {
  const { deleteGoal } = useGoalsContext();
  const { habits } = useHabits();
  const { logs } = useHabitsContext();
  const [timeWindow, setTimeWindow] = useState<TimeWindowKey>('30d');
  const [showAllHabits, setShowAllHabits] = useState(false);
  const [showWhyPane, setShowWhyPane] = useState(false);

  // Find habits linked to this goal
  const linkedHabits = habits.filter(habit => 
    habit.goalIds?.includes(goal.id)
  );

  // Get date range for selected time window
  const { start: startDate, end: endDate } = getWindowRange(timeWindow, logs);

  // Memoize habit logs map for performance
  const habitLogsMap = useMemo(() => {
    const habitLogs: { [habitId: string]: number } = {};
    
    linkedHabits.forEach(habit => {
      const completedCount = logs.filter(log => 
        log.habitId === habit.id && 
        log.date >= startDate.toLocaleDateString('en-CA') &&
        log.date <= endDate.toLocaleDateString('en-CA') &&
        log.state === 'good'
      ).length;
      
      habitLogs[habit.id] = completedCount;
    });
    
    return habitLogs;
  }, [linkedHabits, logs, startDate, endDate]);

  // Calculate goal-level success rate
  const goalSuccessRate = useMemo(() => {
    if (linkedHabits.length === 0) return null;
    return calculateAggregatedSuccessRate(linkedHabits, habitLogsMap, startDate, endDate);
  }, [linkedHabits, habitLogsMap, startDate, endDate]);

  // Calculate individual habit success rates
  const habitSuccessRates = useMemo(() => {
    const rates: { [habitId: string]: number } = {};
    
    linkedHabits.forEach(habit => {
      const completedLogs = habitLogsMap[habit.id] || 0;
      rates[habit.id] = calculateHabitSuccessRate(habit, completedLogs, startDate, endDate);
    });
    
    return rates;
  }, [linkedHabits, habitLogsMap, startDate, endDate]);

  // Calculate totals for "Why?" pane
  const totalExpected = useMemo(() => {
    return linkedHabits.reduce((sum, habit) => {
      return sum + expectedForRange(habit, startDate, endDate);
    }, 0);
  }, [linkedHabits, startDate, endDate]);

  const totalCompleted = useMemo(() => {
    return Object.values(habitLogsMap).reduce((sum, count) => sum + count, 0);
  }, [habitLogsMap]);

  const handleDelete = () => {
    deleteGoal(goal.id);
  };

  if (!isExpanded) return null;

  // Handle habit overflow display logic
  const maxVisibleHabits = 5;
  const visibleHabits = showAllHabits ? linkedHabits : linkedHabits.slice(0, maxVisibleHabits);
  const remainingCount = linkedHabits.length - maxVisibleHabits;
  const shouldShowMoreButton = linkedHabits.length > maxVisibleHabits;

  return (
    <motion.div
      id={`goal-card-${goal.id}`}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: easeOutQuart }}
      className="overflow-hidden"
      aria-labelledby={`goal-title-${goal.id}`}
    >
      <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {goal.description || 'No description provided'}
            </p>
          </div>

          {/* Success Rate with Timeline Picker */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Success Rate (last {humanLabel(timeWindow)})
              </h4>
              <Select value={timeWindow} onValueChange={(value: TimeWindowKey) => setTimeWindow(value)}>
                <SelectTrigger className="w-auto h-7 text-xs text-gray-900 dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <p className={`text-sm font-medium ${
                goalSuccessRate !== null 
                  ? colourClass(rateToColour(goalSuccessRate))
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {goalSuccessRate !== null ? `${Math.round(goalSuccessRate)}%` : '– %'}
              </p>
              {goalSuccessRate !== null && (
                <div className={`w-2 h-2 rounded-full ring-2 ${colourClass(rateToColour(goalSuccessRate), 'ring')}`} />
              )}
            </div>
          </div>

          {/* Habit Breakdown */}
          {linkedHabits.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Habit Breakdown ({linkedHabits.length})
              </h4>
              <div className="space-y-1">
                {visibleHabits.map(habit => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md"
                    title={`${habit.goodHabit} - ${getFrequencyDisplayString(habit)}`}
                    aria-label={`${habit.goodHabit} - ${getFrequencyDisplayString(habit)} - ${Math.round(habitSuccessRates[habit.id] || 0)}% success rate`}
                  >
                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate flex-1">
                      {habit.goodHabit}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getFrequencyDisplayString(habit)}
                      </span>
                      <span className={`text-xs font-medium min-w-[35px] text-right ${colourClass(rateToColour(habitSuccessRates[habit.id] || 0))}`}>
                        {Math.round(habitSuccessRates[habit.id] || 0)}%
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* "Show more" / "Show less" button */}
                {shouldShowMoreButton && (
                  <button
                    onClick={() => setShowAllHabits(!showAllHabits)}
                    className="w-full p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600 transition-colors"
                  >
                    {showAllHabits ? 'Show less' : `+ ${remainingCount} more`}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Collapsible "Why?" Pane */}
          <details 
            className="group"
            open={showWhyPane}
            onToggle={(e) => setShowWhyPane((e.target as HTMLDetailsElement).open)}
          >
            <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
              Why this success rate?
            </summary>
            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Expected logs:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 ml-2">
                    {totalExpected}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Completed logs:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 ml-2">
                    {totalCompleted}
                  </span>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">Window length:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 ml-2">
                  {humanLabel(timeWindow)}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                {SUCCESS_RATE_LEGEND}
              </div>
            </div>
          </details>

          {/* No habits message */}
          {linkedHabits.length === 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Linked Habits (0)
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No habits linked to this goal yet
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <GoalDialog
              goal={goal}
              trigger={
                <Button variant="outline" size="sm" className="flex-1 text-gray-900 dark:text-gray-100">
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              }
            />
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  aria-label="Delete goal"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{goal.title}"? This action cannot be undone.
                    Habits linked to this goal will be unlinked.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Goal
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
